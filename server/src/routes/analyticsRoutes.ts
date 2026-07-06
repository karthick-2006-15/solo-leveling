import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/:metric', getAnalytics);

export default router;
