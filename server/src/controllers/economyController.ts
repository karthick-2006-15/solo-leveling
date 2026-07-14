import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { economyService } from '../services/economyService';
import RewardHistoryLog from '../models/RewardHistoryLog';
import ProgressionProfile from '../models/ProgressionProfile';

export const claimDailyLogin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const timezoneOffset = req.body?.timezoneOffset || 0;
    const result = await economyService.claimDailyLogin(req.user!.id, timezoneOffset);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    // If it's "Daily login already claimed today", we can return a 400
    if (error.message.includes('already claimed')) {
      res.status(400).json({ status: 'fail', message: error.message });
      return;
    }
    next(error);
  }
};

export const claimPerfectDay = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await economyService.evaluatePerfectDay(req.user!.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    if (error.message.includes('already claimed') || error.message.includes('Not all')) {
       res.status(400).json({ status: 'fail', message: error.message });
       return;
    }
    next(error);
  }
};

export const getRewardTimeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await RewardHistoryLog.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    next(error);
  }
};

export const getEconomyStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let profile = await ProgressionProfile.findOne({ userId: req.user!.id });
    if (!profile) {
      profile = await ProgressionProfile.create({ userId: req.user!.id as any });
    }
    res.status(200).json({ 
      status: 'success', 
      data: {
        coins: profile.coins,
        lifetimeCoinsEarned: profile.lifetimeCoinsEarned,
        lifetimeCoinsSpent: profile.lifetimeCoinsSpent,
        weeklyCoins: profile.weeklyCoins,
        monthlyCoins: profile.monthlyCoins,
        currentLoginStreak: profile.currentStreak,
        longestLoginStreak: profile.longestStreak,
        missedDays: profile.missedDays,
        lastClaimDate: profile.lastClaimDate,
        nextClaimAt: profile.nextClaimAt,
        totalClaims: profile.totalClaims
      } 
    });
  } catch (error) {
    next(error);
  }
};
