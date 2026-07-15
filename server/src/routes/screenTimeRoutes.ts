import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import {
  getDashboardData,
  logManualScreenTime,
  analyzeImage,
  getClassifications,
  updateClassification
} from '../controllers/screenTimeController';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', getDashboardData);
router.post('/log', logManualScreenTime);
router.post('/analyze', analyzeImage);
router.get('/classifications', getClassifications);
router.put('/classifications/:id', updateClassification);

export default router;
