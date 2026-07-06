import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

export default router;
