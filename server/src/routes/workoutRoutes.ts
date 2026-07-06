import { Router } from 'express';
import { getRoutines, createRoutine, updateRoutine, deleteRoutine, logSession, getSessions, getPRs, getVolumeHistory } from '../controllers/workoutController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/routines', getRoutines);
router.post('/routines', createRoutine);
router.patch('/routines/:id', updateRoutine);
router.delete('/routines/:id', deleteRoutine);

router.post('/sessions', logSession);
router.get('/sessions', getSessions);

router.get('/prs', getPRs);
router.get('/volume', getVolumeHistory);

export default router;
