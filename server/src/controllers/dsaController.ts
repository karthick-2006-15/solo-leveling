import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { dsaService } from '../services/dsaService';
import { missionService } from '../services/missionService';
import { checkAchievements } from '../services/progressionService';

export const getProblems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const problems = await dsaService.getProblems(req.user!.id, req.query);
  res.status(200).json({ success: true, problems });
});

export const logProblem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await dsaService.logProblem(req.user!.id, req.body);
  
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

export const updateProblem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const problem = await dsaService.updateProblem(req.params.id, req.user!.id, req.body);
  res.status(200).json({ success: true, problem });
});

export const deleteProblem = asyncHandler(async (req: AuthRequest, res: Response) => {
  await dsaService.deleteProblem(req.params.id, req.user!.id);
  res.status(200).json({ success: true });
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await dsaService.getStats(req.user!.id);
  res.status(200).json({ success: true, stats });
});
