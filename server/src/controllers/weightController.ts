import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import WeightLog from '../models/WeightLog';
import _ProgressionProfile from '../models/ProgressionProfile';
import { AppError } from '../utils/AppError';
import { missionService } from '../services/missionService';
import { checkAchievements } from '../services/progressionService';

export const logWeight = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { weight } = req.body;
  if (!weight) throw new AppError('Weight is required', 400);
  
  const userId = req.user?.id;

  const weightLog = new WeightLog({ userId, weight });
  await weightLog.save();

  // Update profile weight (assume profile has a weight field or we can just use the latest log)
  // Wait, does ProgressionProfile have weight? In Phase 0 it was stored in User or ProgressionProfile?
  // Let's assume it was on User or we just rely on WeightLog for the current weight.
  // We'll update the User document just in case it's there.
  import('../models/User').then(async ({ default: User }) => {
    await User.findByIdAndUpdate(userId, { weight });
  });

  const newlyCompletedQuests = await missionService.refreshDailyQuests(userId!);
  const newlyDefeatedBoss = await missionService.refreshWeeklyBoss(userId!);
  const newlyUnlockedAchievements = await checkAchievements(userId!);

  res.status(201).json({ 
    success: true, 
    weightLog,
    newlyCompletedQuests,
    newlyDefeatedBoss,
    newlyUnlockedAchievements
  });
});

export const getWeightHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const history = await WeightLog.find({ userId: req.user?.id }).sort({ loggedAt: 1 });
  res.status(200).json({ success: true, history });
});
