import { Router } from 'express';
import { missionController } from '../controllers/missionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/quests/today', missionController.getDailyQuests);
router.get('/boss/current', missionController.getCurrentBoss);
router.get('/badges', missionController.getBadges);
router.post('/check-in', missionController.checkIn);

export default router;
