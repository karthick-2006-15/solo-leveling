import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getProfile, updateProfile } from '../controllers/careerController';

const router = Router();

router.use(requireAuth);

router.get('/me', getProfile);
router.post('/me', updateProfile);

export default router;
