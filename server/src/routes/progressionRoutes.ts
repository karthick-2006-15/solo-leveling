import { Router } from 'express';
import { getMe, awardDevXP } from '../controllers/progressionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', requireAuth, getMe);

// Only add this route if we are NOT in production
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev/award-xp', requireAuth, awardDevXP);
}

export default router;
