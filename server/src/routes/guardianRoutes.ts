import express from 'express';
import { getDashboard, processAction, acceptMorningOath, generateNightReport } from '../controllers/guardianController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.use(requireAuth);

router.get('/dashboard', getDashboard);
router.post('/action', processAction);
router.post('/morning-oath', acceptMorningOath);
router.get('/night-report', generateNightReport);

export default router;
