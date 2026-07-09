import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  chatWithAria, getMorningReport, getEveningReport, getReports, getMemory,
  getPredictions, runPredictionSweep, createPlan, getPlans, getDecision, getSchedule, addKnowledge, getKnowledge
} from '../controllers/ariaController';
const router = express.Router();

router.use(requireAuth);

router.post('/chat', chatWithAria);
router.post('/report/morning', getMorningReport);
router.post('/report/evening', getEveningReport);
router.get('/reports', getReports);
router.get('/memory', getMemory);

router.get('/predictions', getPredictions);
router.post('/predictions/sweep', runPredictionSweep);

router.get('/plans', getPlans);
router.post('/plans', createPlan);

router.get('/decision', getDecision);
router.post('/schedule', getSchedule);

router.get('/knowledge', getKnowledge);
router.post('/knowledge', addKnowledge);
export default router;
