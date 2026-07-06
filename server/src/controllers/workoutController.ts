import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { workoutService } from '../services/workoutService';
import { missionService } from '../services/missionService';
import { checkAchievements } from '../services/progressionService';

export const getRoutines = asyncHandler(async (req: AuthRequest, res: Response) => {
  const routines = await workoutService.getRoutines(req.user!.id);
  res.status(200).json({ success: true, routines });
});

export const createRoutine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const routine = await workoutService.createRoutine(req.user!.id, req.body);
  res.status(201).json({ success: true, routine });
});

export const updateRoutine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const routine = await workoutService.updateRoutine(req.params.id, req.user!.id, req.body);
  res.status(200).json({ success: true, routine });
});

export const deleteRoutine = asyncHandler(async (req: AuthRequest, res: Response) => {
  await workoutService.deleteRoutine(req.params.id, req.user!.id);
  res.status(200).json({ success: true });
});

export const logSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await workoutService.logSession(req.user!.id, req.body);
  
  // Mission triggers
  const newlyCompletedQuests = await missionService.refreshDailyQuests(req.user!.id);
  const newlyDefeatedBoss = await missionService.refreshWeeklyBoss(req.user!.id);
  const newlyUnlockedAchievements = await checkAchievements(req.user!.id);

  res.status(201).json({
    success: true,
    ...result,
    newlyCompletedQuests,
    newlyDefeatedBoss,
    newlyUnlockedAchievements
  });
});

export const getSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await workoutService.getSessions(req.user!.id);
  res.status(200).json({ success: true, sessions });
});

export const getPRs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prs = await workoutService.getPRs(req.user!.id);
  res.status(200).json({ success: true, prs });
});

export const getVolumeHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await workoutService.getVolumeHistory(req.user!.id);
  res.status(200).json({ success: true, sessions });
});
