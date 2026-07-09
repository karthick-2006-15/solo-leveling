import { Router } from 'express';
import { getMonarchState, triggerManualInnerBattle } from '../controllers/monarchController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getMonarchState);
router.post('/battle', triggerManualInnerBattle);

export default router;
