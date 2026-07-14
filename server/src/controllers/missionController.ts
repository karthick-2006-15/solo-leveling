import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { missionService } from '../services/missionService';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/AppError';
import User from '../models/User';

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

  getCheckInStatus: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    
    const user = await User.findById(req.user.id);
    let hasCheckedInToday = false;
    
    if (user?.healthMetrics?.lastCheckIn) {
      const now = new Date();
      const lastCheckIn = new Date(user.healthMetrics.lastCheckIn);
      if (
        lastCheckIn.getDate() === now.getDate() &&
        lastCheckIn.getMonth() === now.getMonth() &&
        lastCheckIn.getFullYear() === now.getFullYear()
      ) {
        hasCheckedInToday = true;
      }
    }
    
    res.json({ hasCheckedInToday });
  }),

  checkIn: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    
    const { sleepQuality, energyLevel, stressLevel } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);
    
    const now = new Date();
    
    if (user.healthMetrics?.lastCheckIn) {
      const lastCheckIn = new Date(user.healthMetrics.lastCheckIn);
      if (
        lastCheckIn.getDate() === now.getDate() &&
        lastCheckIn.getMonth() === now.getMonth() &&
        lastCheckIn.getFullYear() === now.getFullYear()
      ) {
        res.status(400);
        throw new AppError('Already checked in today', 400);
      }
    }
    
    user.healthMetrics = {
      ...(user.healthMetrics || {}),
      sleepQuality: sleepQuality || 0,
      energyLevel: energyLevel || 0,
      stressLevel: stressLevel || 0,
      screenTimeHours: user.healthMetrics?.screenTimeHours || 0,
      lastCheckIn: now
    };
    
    await user.save();
    
    res.json({ success: true, message: 'Check-in successful' });
  }),

  getShadowArmy: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const shadows = await missionService.getShadowArmy(req.user.id);
    res.json({ shadows });
  }),

  resurrectShadow: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { shadowId } = req.body;
    if (!shadowId) throw new AppError('Missing shadowId', 400);

    const resurrectedQuest = await missionService.resurrectShadow(req.user.id, shadowId);
    res.json({ quest: resurrectedQuest });
  })
};
