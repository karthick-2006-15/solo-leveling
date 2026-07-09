import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  parseFood, 
  searchFood,
  logFood, 
  logManualFood, 
  getFoodLogs, 
  deleteFoodLog, 
  getNutritionSummary,
  logWater,
  getWater,
  analyzeFood
} from '../controllers/nutritionController';
import mongoose from 'mongoose';

const router = Router();

router.use(requireAuth);

// Food routes
router.get('/search', requireAuth, searchFood);

// AI Food Analyzer
router.post('/analyze', requireAuth, analyzeFood);

// Manual food logging
router.post('/parse', parseFood);
router.post('/log', logFood);
router.post('/manual', logManualFood);
router.get('/log', getFoodLogs);
router.delete('/log/:id', deleteFoodLog);
router.get('/summary', getNutritionSummary);

// Water routes
router.post('/water', logWater);
router.get('/water', requireAuth, getWater);
router.get('/clear-cache', async (req, res) => {
  await mongoose.connection.collection('foodcaches').deleteMany({});
  res.json({ message: 'cleared' });
});

export default router;
