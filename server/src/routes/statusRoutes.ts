import { Router } from 'express';
import { getStatusWindow } from '../controllers/statusController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getStatusWindow);

export default router;
