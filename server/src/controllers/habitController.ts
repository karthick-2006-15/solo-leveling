import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { habitService } from '../services/habitService';
import { missionService } from '../services/missionService';
import { checkAchievements } from '../services/progressionService';
import { AppError } from '../utils/AppError';

export const getHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Unauthorized', 401);
  const habits = await habitService.getHabitsWithTodayStatus(req.user.id);
  res.status(200).json({ success: true, habits });
});

export const createHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await habitService.createHabit(req.user!.id, req.body);
  res.status(201).json({ success: true, habit: { ...habit.toObject(), completedToday: false } });
});

export const updateHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await habitService.updateHabit(req.params.id, req.user!.id, req.body);
  res.status(200).json({ success: true, habit });
});

export const deleteHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  await habitService.deleteHabit(req.params.id, req.user!.id);
  res.status(200).json({ success: true });
});

export const completeHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await habitService.completeHabit(req.params.id, req.user!.id);
  
  const newlyCompletedQuests = await missionService.refreshDailyQuests(req.user!.id);
  const newlyDefeatedBoss = await missionService.refreshWeeklyBoss(req.user!.id);
  const newlyUnlockedAchievements = await checkAchievements(req.user!.id);

  res.status(200).json({
    success: true,
    xpResult: result.xpResult,
    habit: {
      ...result.habit.toObject(),
      completedToday: true
    },
    newlyCompletedQuests,
    newlyDefeatedBoss,
    newlyUnlockedAchievements
  });
});

export const getHabitHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dates = await habitService.getHabitHistory(req.params.id, req.user!.id, req.query.range);
  res.status(200).json({ success: true, dates });
});
