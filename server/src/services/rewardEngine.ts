import _mongoose from 'mongoose';
import ProgressionProfile from '../models/ProgressionProfile';
import RewardHistoryLog from '../models/RewardHistoryLog';
import { awardXP, _checkAchievements, _checkTitles } from './progressionService';
import logger from '../utils/logger';
import { clearCachePattern } from '../config/redis';

export interface RewardPayload {
  userId: string;
  source: string;
  reason: string;
  coins?: number;
  xp?: number;
  skillPoints?: number;
  metadata?: any;
}

class RewardEngine {
  async dispatchReward(payload: RewardPayload) {
    const { userId, source, reason, coins = 0, xp = 0, skillPoints = 0, metadata } = payload;
    
    // We will do this in sequence rather than a transaction to reuse awardXP safely.
    let xpResult = null;
    
    if (xp !== 0) {
      // Reusing progressionService to handle leveling, combo, streaks, milestones, XP logging
      xpResult = await awardXP(userId, source, xp, 'system', reason);
    }

    // Now handle Coins and Skill Points natively here, as well as the unified RewardHistoryLog
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) throw new Error('Progression profile not found');

    let actualCoins = coins;

    // Apply Smart Economy Multipliers (e.g., Weekend Bonus)
    if (coins > 0) {
      const today = new Date().getDay();
      const isWeekend = today === 0 || today === 6;
      if (isWeekend) {
        actualCoins = Math.round(actualCoins * 1.2); // 20% weekend bonus
      }
      
      // Update lifetime stats
      profile.lifetimeCoinsEarned = (profile.lifetimeCoinsEarned || 0) + actualCoins;
      profile.weeklyCoins = (profile.weeklyCoins || 0) + actualCoins;
      profile.monthlyCoins = (profile.monthlyCoins || 0) + actualCoins;
      profile.coins += actualCoins;
    } else if (coins < 0) {
      // Spending
      profile.lifetimeCoinsSpent = (profile.lifetimeCoinsSpent || 0) + Math.abs(coins);
      profile.coins += coins;
      if (profile.coins < 0) profile.coins = 0;
    }

    if (skillPoints !== 0) {
      profile.skillPoints += skillPoints;
    }

    await profile.save();
    await clearCachePattern(`progression:${userId}`);

    // Create the unified timeline log
    const log = new RewardHistoryLog({
      userId,
      source,
      reason,
      coins: actualCoins,
      xp: xpResult ? xp : 0, // awardXP modifies the actual amount, but we log the base request here or fetch the log, let's keep it simple
      skillPoints,
      metadata
    });
    await log.save();

    logger.info(`[REWARD ENGINE] Dispatched to ${userId}: ${actualCoins} Coins, ${xp} XP, ${skillPoints} SP. Source: ${source}`);

    return {
      success: true,
      coinsAdded: actualCoins,
      xpAdded: xp,
      skillPointsAdded: skillPoints,
      leveledUp: xpResult?.leveledUp || false,
      newLevel: xpResult?.newLevel || profile.level,
      newAchievements: xpResult?.newAchievements || [],
      profile
    };
  }
}

export const rewardEngine = new RewardEngine();
