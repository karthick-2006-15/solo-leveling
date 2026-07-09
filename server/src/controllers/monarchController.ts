import { _Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { monarchService } from '../services/monarchService';
import LifeChapter from '../models/LifeChapter';
import { _AppError } from '../utils/AppError';

export const getMonarchState = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const monarch = await monarchService.getMonarchState(req.user!.id);
    
    // Also fetch LifeChapter
    let chapter = await LifeChapter.findOne({ userId: req.user!.id });
    if (!chapter) {
      chapter = await LifeChapter.create({ userId: req.user!.id });
    }

    res.status(200).json({ 
      status: 'success', 
      data: { 
        monarch,
        chapter
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const triggerManualInnerBattle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // For testing/manual trigger
    const result = await monarchService.evaluateInnerBattle(req.user!.id, new Date());
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
