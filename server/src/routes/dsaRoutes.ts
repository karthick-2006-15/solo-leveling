import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  getProblems, 
  logProblem, 
  updateProblem, 
  deleteProblem, 
  getStats 
} from '../controllers/dsaController';

const router = Router();
router.use(requireAuth);

router.get('/problems', getProblems);
router.post('/problems', logProblem);
router.patch('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);
router.get('/stats', getStats);

export default router;
