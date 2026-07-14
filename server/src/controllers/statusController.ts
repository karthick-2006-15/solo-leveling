import { Request, Response } from 'express';
import { statusService } from '../services/statusService';
import logger from '../utils/logger';

export const getStatusWindow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const statusData = await statusService.getStatusWindow(userId);
    res.json(statusData);
  } catch (error: any) {
    logger.error('Error fetching status window:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
