import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  getActiveDungeons, generateDailyDungeon, 
  getActiveBosses, getStoryChapters, getCampaigns 
} from '../controllers/dungeonController';

const router = Router();
router.use(requireAuth);

router.get('/', getActiveDungeons);
router.post('/generate', generateDailyDungeon);

router.get('/bosses', getActiveBosses);

router.get('/story', getStoryChapters);

router.get('/campaigns', getCampaigns);

export default router;
