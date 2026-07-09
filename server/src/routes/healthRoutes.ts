import { Router } from 'express';
import { logSleep, logWellness, logBodyMetrics, getHealthAnalytics } from '../controllers/healthController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/sleep', logSleep);
router.post('/wellness', logWellness);
router.post('/body', logBodyMetrics);
router.get('/analytics', getHealthAnalytics);

export default router;
