import { Router } from 'express';
import { getMe, awardDevXP, getPrediction, getHistory, completeFocusSession } from '../controllers/progressionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', requireAuth, getMe);

// Only add this route if we are NOT in production
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev/award-xp', requireAuth, awardDevXP);
}

router.get('/prediction', requireAuth, getPrediction);
router.post('/focus/complete', requireAuth, completeFocusSession);
router.get('/history', requireAuth, getHistory);

export default router;
