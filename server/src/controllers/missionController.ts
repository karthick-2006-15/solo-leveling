import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { missionService } from '../services/missionService';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/AppError';

export const missionController = {
  getDailyQuests: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    
    // Refresh them first just in case
    await missionService.refreshDailyQuests(req.user.id);
    const quests = await missionService.getDailyQuests(req.user.id);
    
    res.json({ quests });
  }),

  getCurrentBoss: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    
    await missionService.refreshWeeklyBoss(req.user.id);
    const boss = await missionService.getCurrentBoss(req.user.id);
    
    res.json({ boss });
  }),

  getBadges: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    
    const badges = await missionService.getBadges(req.user.id);
    res.json({ badges });
  }),

  checkIn: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    
    // In a real implementation, we would save the vitals to calibrate missions.
    // For now, just return success.
    res.json({ success: true, message: 'Check-in successful' });
  })
};
