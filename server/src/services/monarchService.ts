import _mongoose from 'mongoose';
import InnerMonarch from '../models/InnerMonarch';
import QuestInstance from '../models/QuestInstance';
import HabitCompletion from '../models/HabitCompletion';
import RecoveryLog from '../models/RecoveryLog';
import StudySession from '../models/StudySession';
import ProgressionProfile from '../models/ProgressionProfile';
import _logger from '../utils/logger';

class MonarchService {
  /**
   * Evaluates the daily Inner Battle and adjusts attributes.
   * This should be called nightly via cron before mission generation.
   */
  async evaluateInnerBattle(userId: string, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23,59,59,999);

    // Ensure Monarch doc exists
    let monarch = await InnerMonarch.findOne({ userId });
    if (!monarch) {
      monarch = await InnerMonarch.create({ userId });
    }

    // 1. Gather data for today
    const [quests, habits, recovery, studies, user] = await Promise.all([
      QuestInstance.find({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      HabitCompletion.find({ userId, completedAt: { $gte: startOfDay, $lte: endOfDay } }),
      RecoveryLog.findOne({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      StudySession.find({ userId, startTime: { $gte: startOfDay, $lte: endOfDay } }),
      ProgressionProfile.findOne({ userId })
    ]);

    // Track deltas
    const deltas = {
      willpower: 0,
      focus: 0,
      discipline: 0,
      wisdom: 0,
      resilience: 0,
      courage: 0,
      consistency: 0,
      patience: 0,
      adaptability: 0,
      selfControl: 0,
      corruption: 0,
      dopamineBalance: 0
    };

    // Calculate Discipline (Mission / Habit completion)
    let completedQuests = 0;
    let abandonedQuests = 0;
    quests.forEach(q => {
      if (q.status === 'completed') completedQuests++;
      else if (q.status === 'failed') abandonedQuests++;
    });

    if (quests.length > 0) {
      const completionRate = completedQuests / quests.length;
      if (completionRate > 0.8) {
        deltas.discipline += 1;
        deltas.dopamineBalance += 10; // High dopamine from success
      }
      else if (completionRate < 0.4) {
        deltas.discipline -= 1;
        deltas.dopamineBalance -= 5;
      }
    }

    if (habits.length > 3) deltas.discipline += 1;

    // Calculate Willpower and Corruption
    if (abandonedQuests > 0) {
      deltas.willpower -= 2;
      deltas.corruption += (abandonedQuests * 5); // Failing missions corrupts the user
    }
    
    // Recovery protocols slightly reduce corruption and restore dopamine
    if (recovery && recovery.recoveryScore > 80) {
      deltas.corruption -= 5;
      deltas.dopamineBalance += 5;
    }

    if (recovery && recovery.components?.stressPenalty > 10) {
       deltas.dopamineBalance -= 15; // High stress depletes dopamine
    }

    // Calculate Focus & Wisdom
    let totalFocusMinutes = 0;
    studies.forEach(s => totalFocusMinutes += s.durationMinutes || 0);
    if (totalFocusMinutes > 60) {
      deltas.focus += 1;
      deltas.wisdom += 1;
    }

    // Calculate Resilience
    // E.g., coming back from a missed day (if yesterday had 0 completed, today has > 0)
    
    // Calculate Consistency (streak)
    if (user?.currentStreak && user.currentStreak > 3) {
       deltas.consistency += 1;
    }

    // Apply Deltas with bounds checking (0-100)
    for (const key of Object.keys(deltas)) {
      const k = key as keyof typeof deltas;
      monarch.attributes[k] = Math.min(100, Math.max(0, monarch.attributes[k] + deltas[k]));
    }

    // Update Balances
    monarch.balance.mind = (monarch.attributes.focus + monarch.attributes.wisdom) / 2;
    monarch.balance.discipline = (monarch.attributes.discipline + monarch.attributes.consistency + monarch.attributes.willpower) / 3;
    monarch.balance.body = recovery?.energyScore || 50;
    monarch.balance.recovery = recovery?.recoveryScore || 50;
    monarch.balance.overall = (monarch.balance.mind + monarch.balance.discipline + monarch.balance.body + monarch.balance.recovery) / 4;

    // 2. Calculate Shadow Power
    // Base shadow power grows slowly, spiked by bad habits / bad recovery
    let shadowStrength = 30; // Baseline
    if (abandonedQuests > 0) shadowStrength += (abandonedQuests * 10);
    if (recovery && recovery.recoveryScore < 40) shadowStrength += 15;
    if (recovery && recovery.components?.stressPenalty > 10) shadowStrength += 10;
    
    // 3. Inner Battle
    const innerStrength = monarch.balance.overall;
    monarch.latestInnerStrength = innerStrength;
    monarch.latestShadowStrength = shadowStrength;

    // Save historical snapshot once a week (e.g. Sunday)
    if (date.getDay() === 0) {
      monarch.history.push({
        date: startOfDay,
        attributes: { ...monarch.attributes }
      });
      // Keep only last 52 weeks
      if (monarch.history.length > 52) monarch.history.shift();
    }

    await monarch.save();

    return {
      monarch,
      innerStrength,
      shadowStrength,
      shadowWinning: shadowStrength > innerStrength
    };
  }

  async getMonarchState(userId: string) {
    let monarch = await InnerMonarch.findOne({ userId });
    if (!monarch) {
      monarch = await InnerMonarch.create({ userId });
    }
    return monarch;
  }

  /**
   * Directly adjust monarch attributes in real-time (e.g., from completing a Focus Session).
   */
  async adjustAttributes(userId: string, changes: Partial<Record<keyof typeof InnerMonarch.schema.obj.attributes, number>>) {
    let monarch = await InnerMonarch.findOne({ userId });
    if (!monarch) {
      monarch = await InnerMonarch.create({ userId });
    }

    let modified = false;
    for (const [key, value] of Object.entries(changes)) {
      const attrKey = key as keyof typeof monarch.attributes;
      if (typeof monarch.attributes[attrKey] !== 'undefined' && typeof value === 'number') {
        monarch.attributes[attrKey] = Math.min(100, Math.max(0, monarch.attributes[attrKey] + value));
        modified = true;
      }
    }

    if (modified) {
      await monarch.save();
    }
    return monarch;
  }
}

export const monarchService = new MonarchService();
