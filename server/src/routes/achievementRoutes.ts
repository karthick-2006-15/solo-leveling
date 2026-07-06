import { Router } from 'express';
import { getAchievements } from '../controllers/achievementController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getAchievements);

export default router;
