import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { claimDailyLogin, claimPerfectDay, getRewardTimeline, getEconomyStats } from '../controllers/economyController';

const router = Router();
router.use(requireAuth);

router.get('/stats', getEconomyStats);
router.get('/timeline', getRewardTimeline);
router.post('/login', claimDailyLogin);
router.post('/perfect-day', claimPerfectDay);

export default router;
