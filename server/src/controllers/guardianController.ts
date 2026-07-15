import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { guardianService } from '../services/guardianService';
import { guardianAiService } from '../services/guardianAiService';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const profile = await guardianService.getProfile(userId);
    const boss = await guardianService.getBoss(userId);
    const recentLogs = await guardianService.getRecentLogs(userId, 10);
    
    // Auto-predict based on logs if requested (could be cached)
    const aiMessage = await guardianAiService.predictTriggers(recentLogs);

    res.json({
      profile,
      boss,
      recentLogs,
      aiMessage
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const processAction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { actionType, durationMinutes, emotion, triggerContext } = req.body;
    
    if (actionType === 'relapse') {
      const result = await guardianService.processRelapse(userId, emotion, triggerContext);
      return res.json(result);
    } else {
      const result = await guardianService.processRecoveryAction(userId, actionType, durationMinutes, emotion, triggerContext);
      return res.json(result);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptMorningOath = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await guardianService.acceptMorningOath(userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generateNightReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const profile = await guardianService.getProfile(userId);
    const recentLogs = await guardianService.getRecentLogs(userId, 50);

    const report = await guardianAiService.generateNightReport(profile, recentLogs);
    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
