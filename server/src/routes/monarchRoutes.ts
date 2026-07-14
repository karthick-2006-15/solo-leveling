import { Router } from 'express';
import { getMonarchState, triggerManualInnerBattle, adjustAttributes } from '../controllers/monarchController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getMonarchState);
router.post('/battle', triggerManualInnerBattle);
router.post('/adjust', adjustAttributes);

export default router;
