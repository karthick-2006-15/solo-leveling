import express from 'express';
import { getSettings, updateSettings, subscribePush, unsubscribePush, testPush } from '../controllers/notificationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.use(requireAuth); // All routes require authentication

router.route('/settings')
  .get(getSettings)
  .patch(updateSettings);

router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);
router.post('/test', testPush);

export default router;
