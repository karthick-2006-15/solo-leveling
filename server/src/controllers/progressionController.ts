import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { getProgressionProfile, awardXP } from '../services/progressionService';
import { xpRequiredForLevel } from '../config/progressionConfig';
import { AppError } from '../utils/AppError';
import { monarchService } from '../services/monarchService';

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await getProgressionProfile(req.user!.id);
  
  res.status(200).json({
    success: true,
    progression: {
      level: profile.level,
      rank: profile.rank,
      currentXP: profile.currentXP,
      xpRequired: xpRequiredForLevel(profile.level),
      totalXP: profile.totalXP,
      coins: profile.coins,
      skillPoints: profile.skillPoints,
      activeTitle: profile.hunterTitle,
      hunterClass: profile.hunterClass,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      unlockedAchievements: profile.unlockedAchievements
    }
  });
});

export const awardDevXP = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    throw new AppError('Endpoint not found', 404);
  }

  const { source, amount } = req.body;
  if (!source || !amount || typeof amount !== 'number') {
    throw new AppError('Invalid payload', 400);
  }

  if (!req.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  const result = await awardXP(req.user.id, source, amount);

  res.status(200).json({
    success: true,
    result
  });
});

export const completeFocusSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { durationMinutes } = req.body;
  if (!durationMinutes || typeof durationMinutes !== 'number') {
    throw new AppError('Invalid duration', 400);
  }

  if (!req.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  // Award XP based on duration (e.g. 5 XP per minute)
  const xpAward = durationMinutes * 5;
  const result = await awardXP(req.user.id, 'focus_session', xpAward);

  // Restore willpower
  const willpowerRestore = Math.floor(durationMinutes / 5); // 1 willpower per 5 mins
  await monarchService.adjustAttributes(req.user.id, { willpower: willpowerRestore });

  res.status(200).json({
    success: true,
    result,
    message: `Focus session completed. +${xpAward} XP, +${willpowerRestore} Willpower.`
  });
});

export const getPrediction = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Mock prediction implementation
  res.status(200).json({
    prediction: {
      averageDailyXP: 320,
      daysToNextLevel: 4,
      daysToNextRank: 12,
      nextRank: 'C-Rank Hunter',
      monthlyPrediction: 9600
    }
  });
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Mock history implementation
  res.status(200).json({
    history: []
  });
});
