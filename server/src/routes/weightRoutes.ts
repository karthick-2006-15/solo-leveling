import { Router } from 'express';
import { logWeight, getWeightHistory } from '../controllers/weightController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', logWeight);
router.get('/history', getWeightHistory);

export default router;
