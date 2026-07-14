import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getProfile, updateProfile, completeAcademicTask } from '../controllers/academicController';

const router = Router();

router.use(requireAuth);

router.get('/me', getProfile);
router.post('/me', updateProfile);
router.post('/complete-task', completeAcademicTask);

export default router;
