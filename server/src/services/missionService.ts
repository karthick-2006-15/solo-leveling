import QuestInstance from '../models/QuestInstance';
import WeeklyBossInstance from '../models/WeeklyBossInstance';
import Badge from '../models/Badge';
import WorkoutSession from '../models/WorkoutSession';
import FoodLog from '../models/FoodLog';
import WaterLog from '../models/WaterLog';
import DSAProblem from '../models/DSAProblem';
import HabitCompletion from '../models/HabitCompletion';
import _Habit from '../models/Habit';
import StudySession from '../models/StudySession';
import { userRepository } from '../repositories/userRepository';
import { QUEST_TEMPLATES } from '../config/questTemplates';
import { BOSS_TEMPLATES } from '../config/bossTemplates';
import { awardXP, awardCoins } from './progressionService';

const getStartOfDay = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const getStartOfWeek = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  return new Date(d.setUTCDate(diff));
};

const getEndOfWeek = (date: Date = new Date()) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

// Shuffles an array and picks N elements
const pickRandom = (arr: any[], n: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

export const missionService = {
  getDailyQuests: async (userId: string) => {
    const today = getStartOfDay();
    let quests = await QuestInstance.find({ userId, date: today });

    if (quests.length === 0) {
      // Lazy generate
      const templates = pickRandom(QUEST_TEMPLATES, 4);
      const instances = templates.map(t => ({
        userId: userId as any,
        date: today,
        templateId: t.id,
        title: t.title,
        description: t.description,
        targetValue: t.targetValue || 1,
        currentProgress: 0,
        xpReward: t.xpReward,
        coinReward: t.coinReward
      }));
      quests = await QuestInstance.insertMany(instances);
    }
    return quests;
  },

  getCurrentBoss: async (userId: string) => {
    const startOfWeek = getStartOfWeek();
    let boss = await WeeklyBossInstance.findOne({ userId, weekStartDate: startOfWeek });

    if (!boss) {
      // Find week number to cycle templates
      const weekNum = Math.floor(startOfWeek.getTime() / (7 * 24 * 60 * 60 * 1000));
      const template = BOSS_TEMPLATES[weekNum % BOSS_TEMPLATES.length];
      
      boss = await WeeklyBossInstance.create({
        userId,
        weekStartDate: startOfWeek,
        templateId: template.id,
        requirements: template.requirements.map(r => ({
          ...r,
          currentProgress: 0
        }))
      });
    }
    return boss;
  },

  refreshDailyQuests: async (userId: string) => {
    const today = getStartOfDay();
    const endToday = getEndOfDay();
    const quests = await missionService.getDailyQuests(userId);
    const user = await userRepository.findById(userId);
    const newlyCompleted = [];

    // Pre-fetch some generic stats for today to avoid querying per quest
    const workoutsToday = await WorkoutSession.countDocuments({ userId, date: { $gte: today, $lte: endToday } });
    const dsaToday = await DSAProblem.countDocuments({ userId, dateSolved: { $gte: today, $lte: endToday } });
    const studyToday = await StudySession.countDocuments({ userId, loggedAt: { $gte: today, $lte: endToday } });
    
    // Habits
    const habitCompletions = await HabitCompletion.find({ userId, completedAt: { $gte: today, $lte: endToday } }).populate('habitId');
    const distinctHabitsCompleted = new Set(habitCompletions.map(c => c.habitId._id.toString())).size;

    // Nutrition
    const foodLogs = await FoodLog.find({ userId, date: { $gte: today, $lte: endToday } });
    let calories = 0;
    let protein = 0;
    foodLogs.forEach(l => {
      calories += l.nutrients.calories;
      protein += l.nutrients.protein;
    });
    
    const waterLogs = await WaterLog.find({ userId, date: { $gte: today, $lte: endToday } });
    const waterMl = waterLogs.reduce((sum, l) => sum + l.amountMl, 0);

    for (const quest of quests) {
      if (quest.completed) continue;

      let progress = 0;
      switch (quest.templateId) {
        case 'quest_workout':
          progress = workoutsToday;
          break;
        case 'quest_dsa':
          progress = dsaToday;
          break;
        case 'quest_study':
          progress = studyToday;
          break;
        case 'quest_habit_count':
          progress = distinctHabitsCompleted;
          break;
        case 'quest_read':
          progress = habitCompletions.some((c: any) => c.habitId && c.habitId.title && c.habitId.title.toLowerCase().includes('read')) ? 1 : 0;
          break;
        case 'quest_protein':
          progress = protein >= (user?.dailyProteinGoal || 100) ? 1 : 0;
          break;
        case 'quest_calorie':
          progress = calories >= (user?.dailyCalorieGoal || 2000) ? 1 : 0;
          break;
        case 'quest_water':
          progress = waterMl >= ((user?.dailyWaterGoalLiters || 2.5) * 1000) ? 1 : 0;
          break;
        default: {
          const template = QUEST_TEMPLATES.find(t => t.id === quest.templateId);
          if (template?.checkType === 'habit_completed_today' && template.habitKey) {
             progress = habitCompletions.some((c: any) => c.habitId && c.habitId.title && c.habitId.title.toLowerCase().includes(template.habitKey!)) ? 1 : 0;
          }
          break;
        }
      }

      if (progress !== quest.currentProgress) {
        quest.currentProgress = progress;
        if (quest.currentProgress >= (quest.targetValue || 1)) {
          quest.completed = true;
          quest.completedAt = new Date();
          
          await awardXP(userId, `daily_quest:${quest._id}`, quest.xpReward);
          await awardCoins(userId, quest.coinReward, `daily_quest:${quest._id}`);
          
          newlyCompleted.push(quest);
        }
        await quest.save();
      }
    }
    return newlyCompleted;
  },

  refreshWeeklyBoss: async (userId: string) => {
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    const boss = await missionService.getCurrentBoss(userId);
    if (boss.defeated) return null;

    const user = await userRepository.findById(userId);

    // Fetch week's data
    const workouts = await WorkoutSession.find({ userId, date: { $gte: startOfWeek, $lte: endOfWeek } });
    const dsaCount = await DSAProblem.countDocuments({ userId, dateSolved: { $gte: startOfWeek, $lte: endOfWeek } });
    const studySessions = await StudySession.find({ userId, loggedAt: { $gte: startOfWeek, $lte: endOfWeek } });
    const habitCompletions = await HabitCompletion.find({ userId, completedAt: { $gte: startOfWeek, $lte: endOfWeek } }).populate('habitId');
    const foodLogs = await FoodLog.find({ userId, date: { $gte: startOfWeek, $lte: endOfWeek } });

    // Group logs by day to check daily targets (like protein goal days)
    const activeWorkoutDays = new Set(workouts.map(w => w.date.toISOString().split('T')[0])).size;
    
    const studyHours = studySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;

    const dailyProtein: Record<string, number> = {};
    foodLogs.forEach(l => {
      const d = l.date.toISOString().split('T')[0];
      dailyProtein[d] = (dailyProtein[d] || 0) + l.nutrients.protein;
    });
    const proteinGoalDays = Object.values(dailyProtein).filter(p => p >= (user?.dailyProteinGoal || 100)).length;

    let allMet = true;

    for (const req of boss.requirements) {
      let progress = 0;
      if (req.metric === 'workout_days_this_week') {
        progress = activeWorkoutDays;
      } else if (req.metric === 'dsa_problems_this_week') {
        progress = dsaCount;
      } else if (req.metric === 'study_hours_this_week') {
        progress = Math.floor(studyHours);
      } else if (req.metric === 'protein_goal_days_this_week') {
        progress = proteinGoalDays;
      } else if (req.metric === 'habit_completed_days_this_week' && req.habitKey) {
        // Count distinct days this habit was completed
        const completedDays = new Set(
          habitCompletions
            .filter((c: any) => c.habitId && c.habitId.title && c.habitId.title.toLowerCase().includes(req.habitKey!))
            .map(c => c.completedAt.toISOString().split('T')[0])
        ).size;
        progress = completedDays;
      }

      req.currentProgress = progress;
      if (req.currentProgress < req.target) {
        allMet = false;
      }
    }

    let newlyDefeated = null;
    if (allMet && !boss.defeated) {
      boss.defeated = true;
      boss.defeatedAt = new Date();
      
      const template = BOSS_TEMPLATES.find(t => t.id === boss.templateId);
      if (template) {
        await awardXP(userId, `weekly_boss:${boss._id}`, template.xpReward);
        await awardCoins(userId, template.coinReward, `weekly_boss:${boss._id}`);
        
        await Badge.create({
          userId,
          badgeId: template.badgeId,
          name: template.badgeName,
          icon: '👑', // Default icon for bosses
          description: `Defeated the ${template.name}`,
          earnedFrom: `weekly_boss:${template.id}`
        });
      }
      newlyDefeated = boss;
    }

    await boss.save();
    return newlyDefeated;
  },

  getBadges: async (userId: string) => {
    return Badge.find({ userId }).sort({ earnedAt: -1 });
  }
};
