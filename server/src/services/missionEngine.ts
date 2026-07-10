import mongoose from 'mongoose';
import User from '../models/User';
import MissionTemplate, { IMissionTemplate } from '../models/MissionTemplate';
import QuestInstance, { IQuestInstance } from '../models/QuestInstance';
import logger from '../utils/logger';
import RecoveryLog from '../models/RecoveryLog';
import Dungeon from '../models/Dungeon';
import { monarchService } from './monarchService';
import { bossService } from './bossService';

export const generateDailyMissions = async (userId: string, date: Date = new Date()) => {
  // Reset date to start of day
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Check if quests already generated for today
  const existingQuests = await QuestInstance.find({ userId, date: startOfDay });
  if (existingQuests.length > 0) {
    logger.info(`Missions already generated for user ${userId} on ${startOfDay.toISOString()}`);
    return existingQuests;
  }

  // 1. Fetch active templates
  const templates = await MissionTemplate.find({ userId, active: true });
  
  if (templates.length === 0) {
    logger.info(`No active mission templates found for user ${userId}`);
    return [];
  }

  // 2. Evaluate Health Metrics (Recovery Intelligence) & Inner Battle
  const recoveryLog = await RecoveryLog.findOne({ userId, date: startOfDay });
  let needsRecovery = false;
  if (recoveryLog) {
     needsRecovery = recoveryLog.recoveryScore < 40 || recoveryLog.energyScore < 40;
  } else {
     const health = user.healthMetrics || { sleepQuality: 80, energyLevel: 80, stressLevel: 20, screenTimeHours: 4, lastCheckIn: new Date() };
     needsRecovery = health.sleepQuality < 50 || health.energyLevel < 40 || health.stressLevel > 80;
  }

  // Inner Battle Check
  const battleResult = await monarchService.evaluateInnerBattle(userId, startOfDay);
  const shadowWinning = battleResult.shadowWinning;

  // 3. Evaluate Special Days (Exam, Holiday, etc.)
  const specialDay = user.specialDays?.find((d: any) => {
    const dStart = new Date(d.date);
    dStart.setUTCHours(0,0,0,0);
    return dStart.getTime() === startOfDay.getTime();
  });

  const generatedInstances: IQuestInstance[] = [];
  const templateToInstanceMap = new Map<string, mongoose.Types.ObjectId>();

  // Helper to calculate adaptive difficulty
  // Currently simplified: just use the scaling factor if they're on a streak
  // (Assuming we track streaks per template in the future, for now baseline)
  const getMultiplier = (template: IMissionTemplate) => {
    let mult = 1.0;
    if (needsRecovery && template.category === 'fitness') mult *= 0.5; // Easier fitness
    if (specialDay && specialDay.type === 'holiday' && template.category === 'study') mult *= 0.5;
    if (specialDay && specialDay.type === 'exam' && template.category === 'study') mult *= 1.5;
    
    // If Shadow is winning, make regular missions easier to prevent further burnout
    if (shadowWinning) mult *= 0.8;

    return mult;
  };

  // First pass: Create all instances (unlinked dependencies)
  for (const t of templates) {
    // If it's fitness and we need recovery, maybe we swap it out? 
    // For now, we just drastically reduce the difficulty/XP and change title.
    const multiplier = getMultiplier(t);
    const isRecoveryAdjusted = needsRecovery && t.category === 'fitness';

    const instance = new QuestInstance({
      userId,
      date: startOfDay,
      templateId: t._id.toString(),
      title: isRecoveryAdjusted ? `[RECOVERY] ${t.title}` : t.title,
      description: isRecoveryAdjusted ? `Take it easy today. ${t.description}` : t.description,
      xpReward: Math.round(t.baseXP * multiplier),
      coinReward: Math.round(t.baseCoins * multiplier),
      status: t.prerequisites.length > 0 ? 'locked' : 'available',
      difficultyMultiplier: multiplier,
      type: t.isBonus ? 'bonus' : t.isEmergency ? 'emergency' : t.isHidden ? 'hidden' : 'daily',
      dependencies: [] // We will map these in pass 2
    });

    await instance.save();
    generatedInstances.push(instance);
    templateToInstanceMap.set(t._id.toString(), instance._id as mongoose.Types.ObjectId);
  }

  // Inject Purification Ritual if Shadow is winning
  if (shadowWinning) {
    const purificationQuest = new QuestInstance({
      userId,
      templateId: null,
      title: 'Purification Ritual',
      description: 'The Shadow Power is growing. Restore your Inner Monarch by taking 15 minutes to reflect, meditate, and write down 3 goals for tomorrow.',
      category: 'wellness',
      difficulty: 'D',
      xpReward: 100,
      coinReward: 20,
      requirements: [{
        description: 'Complete Purification Ritual',
        targetAmount: 1,
        currentAmount: 0,
        unit: 'session'
      }],
      date: startOfDay,
      status: 'available'
    });
    await purificationQuest.save();
    generatedInstances.push(purificationQuest);
    logger.info(`Injected Purification Ritual for user ${userId} due to Shadow Power overload.`);
  }

  // Second pass: Map dependencies (DAG resolution)
  for (const instance of generatedInstances) {
    if (!instance.templateId) continue;
    const t = templates.find(temp => temp._id.toString() === instance.templateId);
    if (t && t.prerequisites && t.prerequisites.length > 0) {
      const depIds: mongoose.Types.ObjectId[] = [];
      for (const preReqId of t.prerequisites.map((dep: mongoose.Types.ObjectId) => dep.toString())) {
        const mappedInstId = templateToInstanceMap.get(preReqId.toString());
        if (mappedInstId) {
          depIds.push(mappedInstId);
        }
      }
      if (depIds.length > 0) {
        instance.dependencies = depIds;
        await instance.save();
      } else {
        // Prerequisites aren't active today, so unlock it immediately
        instance.status = 'available';
        await instance.save();
      }
    }
  }

  logger.info(`Generated ${generatedInstances.length} adaptive missions for user ${userId}`);
  return generatedInstances;
};

export const completeMission = async (instanceId: string, userId: string) => {
  const instance = await QuestInstance.findOne({ _id: instanceId, userId });
  if (!instance) throw new Error('Quest not found');
  if (instance.status !== 'available') throw new Error('Quest is not available to complete');

  instance.status = 'completed';
  instance.completed = true;
  instance.completedAt = new Date();
  await instance.save();

  // 1. DAG Resolution: Check if this unlocks other quests
  // Find all quests for today that have this instance in their dependencies
  const lockedQuests = await QuestInstance.find({
    userId,
    date: instance.date,
    status: 'locked'
  });

  const unlockedIds: string[] = [];

  for (const locked of lockedQuests) {
    if (locked.dependencies?.some(dep => dep.toString() === instance._id.toString())) {
      // Check if ALL dependencies are completed
      let allMet = true;
      for (const depId of (locked.dependencies || [])) {
        const depQuest = await QuestInstance.findById(depId);
        if (!depQuest || depQuest.status !== 'completed') {
          allMet = false;
          break;
        }
      }
      
      if (allMet) {
        locked.status = 'available';
        await locked.save();
        unlockedIds.push(locked._id.toString());
      }
    }
  }

  // 2. Bonus Mission check
  // Check if all daily non-bonus quests are completed
  const remainingDailies = await QuestInstance.countDocuments({
    userId,
    date: instance.date,
    type: 'daily',
    status: { $ne: 'completed' }
  });

  let bonusTriggered = false;
  if (remainingDailies === 0 && instance.type === 'daily') {
    // Unlock any bonus quests
    const bonusQuests = await QuestInstance.find({
      userId,
      date: instance.date,
      type: 'bonus',
      status: 'locked'
    });

    for (const b of bonusQuests) {
      // Bonus quests usually unlock when all dailies are done
      b.status = 'available';
      await b.save();
      bonusTriggered = true;
      unlockedIds.push(b._id.toString());
    }
  }

  // 3. Phase 8: Boss Damage Integration
  // Check if this quest is part of an active dungeon
  const activeDungeon = await Dungeon.findOne({
    userId,
    status: 'Active',
    missions: instance._id
  });

  if (activeDungeon) {
    await bossService.damageBoss(userId, activeDungeon._id.toString());
  }

  return {
    quest: instance,
    unlockedQuests: unlockedIds,
    bonusTriggered
  };
};
