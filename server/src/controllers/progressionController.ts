import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { getProgressionProfile, awardXP } from '../services/progressionService';
import { xpRequiredForLevel } from '../config/progressionConfig';
import { AppError } from '../utils/AppError';

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
