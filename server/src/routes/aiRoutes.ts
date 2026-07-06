import express from 'express';
import { chat, getHistory, generateMealPlan, generateWeeklyReview } from '../controllers/aiController';
import { requireAuth } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 30, // limit each IP to 30 requests per windowMs
  message: { message: 'Too many requests to ARIA, please try again after an hour' }
});

router.use(requireAuth);

router.post('/chat', chatLimiter, chat);
router.get('/history', getHistory);
router.post('/meal-plan', generateMealPlan);
router.post('/weekly-review', generateWeeklyReview);

export default router;
