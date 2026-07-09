import mongoose from 'mongoose';
import ProgressionProfile from '../models/ProgressionProfile';
import QuestInstance from '../models/QuestInstance';
import _HabitCompletion from '../models/HabitCompletion';
import RecoveryLog from '../models/RecoveryLog';
import _StudySession from '../models/StudySession';
import { rewardEngine } from './rewardEngine';
import _logger from '../utils/logger';

class EconomyService {
  async claimDailyLogin(userId: string) {
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) throw new Error('Profile not found');

    const now = new Date();
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    const lastLogin = profile.lastLoginDate;
    
    if (lastLogin) {
      const last = new Date(lastLogin);
      last.setUTCHours(0,0,0,0);
      
      const diffTime = Math.abs(today.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 0) {
        throw new Error('Daily login already claimed today');
      } else if (diffDays === 1) {
        profile.currentLoginStreak += 1;
      } else {
        // Broken streak
        profile.missedDays += (diffDays - 1);
        profile.currentLoginStreak = 1;
      }
    } else {
      profile.currentLoginStreak = 1;
    }

    if (profile.currentLoginStreak > profile.longestLoginStreak) {
      profile.longestLoginStreak = profile.currentLoginStreak;
    }

    profile.lastLoginDate = now;
    await profile.save(); // Save streak first

    // Reward Calendar Logic
    const dayInCycle = ((profile.currentLoginStreak - 1) % 30) + 1;
    let rewardCoins = 0;
    let rewardXP = 0;
    let rewardSP = 0;
    let specialMessage = '';

    if (dayInCycle === 7) {
      rewardCoins = 500;
      rewardXP = 1000;
      specialMessage = 'Day 7 Milestone: Bronze Chest (Mocked with bonus coins & XP)';
    } else if (dayInCycle === 14) {
      rewardCoins = 1000;
      rewardXP = 2000;
      rewardSP = 1;
      specialMessage = 'Day 14 Milestone: Silver Chest (Mocked with bonus coins & SP)';
    } else if (dayInCycle === 30) {
      rewardCoins = 3000;
      rewardXP = 5000;
      rewardSP = 5;
      specialMessage = 'Day 30 Milestone: Legendary Reward (Mocked)';
    } else {
      // Normal Days
      if (dayInCycle % 3 === 0) {
        rewardCoins = 50 + (profile.currentLoginStreak * 5); // Scaling coins
      } else if (dayInCycle % 2 === 0) {
        rewardXP = 100 + (profile.currentLoginStreak * 10);
      } else {
        rewardCoins = 20 + (profile.currentLoginStreak * 2);
      }
    }

    const result = await rewardEngine.dispatchReward({
      userId,
      source: 'daily_login',
      reason: `Daily Login Streak: Day ${profile.currentLoginStreak}`,
      coins: rewardCoins,
      xp: rewardXP,
      skillPoints: rewardSP,
      metadata: { dayInCycle, specialMessage }
    });

    return {
      success: true,
      streak: profile.currentLoginStreak,
      rewardResult: result,
      specialMessage
    };
  }

  async evaluatePerfectDay(userId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 1. Check all daily missions
    const missions = await QuestInstance.find({ userId, date: { $gte: today, $lte: endOfDay } });
    if (missions.length === 0) throw new Error("No missions assigned today");
    
    const uncompletedMissions = missions.filter(m => m.status !== 'completed');
    if (uncompletedMissions.length > 0) {
      throw new Error("Not all daily missions are completed");
    }

    // 2. Check Recovery (must be > 70 for perfect day)
    const recovery = await RecoveryLog.findOne({ userId, date: { $gte: today, $lte: endOfDay } });
    if (!recovery || recovery.recoveryScore < 70) {
      throw new Error("Recovery score is below target (70)");
    }

    // 3. Prevent duplicate perfect day claims
    // We could check if a 'perfect_day' reward exists for today in the history log
    const existingLog = await mongoose.model('RewardHistoryLog').findOne({
      userId,
      source: 'perfect_day',
      createdAt: { $gte: today, $lte: endOfDay }
    });
    if (existingLog) {
      throw new Error("Perfect Day already claimed today");
    }

    // Dispatch Reward
    const result = await rewardEngine.dispatchReward({
      userId,
      source: 'perfect_day',
      reason: 'Achieved Perfect Day',
      coins: 200,
      xp: 500,
      skillPoints: 0
    });

    return result;
  }
}

export const economyService = new EconomyService();
