import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { healthService } from '../services/healthService';
import { AppError } from '../utils/AppError';

export const logSleep = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sleepLog = await healthService.logSleep(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: { sleepLog } });
  } catch (error) {
    next(error);
  }
};

export const logWellness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wellnessLog = await healthService.logWellness(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: { wellnessLog } });
  } catch (error) {
    next(error);
  }
};

export const logBodyMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bodyLog = await healthService.logBodyMetrics(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: { bodyLog } });
  } catch (error) {
    next(error);
  }
};

export const getHealthAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await healthService.getHealthAnalytics(req.user!.id, days);
    res.status(200).json({ status: 'success', data: analytics });
  } catch (error) {
    next(error);
  }
};
