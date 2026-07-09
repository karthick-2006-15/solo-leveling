import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { dungeonService } from '../services/dungeonService';
import { bossService } from '../services/bossService';
import { storyService } from '../services/storyService';
import { campaignService } from '../services/campaignService';

// Dungeons
export const getActiveDungeons = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dungeons = await dungeonService.getActiveDungeons(req.user!.id);
    res.status(200).json({ status: 'success', data: dungeons });
  } catch (error) { next(error); }
};

export const generateDailyDungeon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dungeon = await dungeonService.generateDailyDungeon(req.user!.id);
    
    // Spawn Boss for this dungeon
    const boss = await bossService.spawnBoss(
      req.user!.id,
      dungeon._id.toString(),
      'Boss of Laziness', // Dynamic name generation in future
      200,
      50 // Damage per mission
    );

    res.status(200).json({ status: 'success', data: { dungeon, boss } });
  } catch (error) { next(error); }
};

// Bosses
export const getActiveBosses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bosses = await bossService.getActiveBosses(req.user!.id);
    res.status(200).json({ status: 'success', data: bosses });
  } catch (error) { next(error); }
};

// Story
export const getStoryChapters = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await storyService.checkStoryProgression(req.user!.id);
    const chapters = await storyService.getUnlockedChapters(req.user!.id);
    res.status(200).json({ status: 'success', data: chapters });
  } catch (error) { next(error); }
};

// Campaigns
export const getCampaigns = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const campaigns = await campaignService.getActiveCampaigns(req.user!.id);
    res.status(200).json({ status: 'success', data: campaigns });
  } catch (error) { next(error); }
};
