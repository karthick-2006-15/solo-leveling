import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getInventory, getInventoryStats, getInventoryHistory, toggleFavorite, addItemDebug } from '../controllers/inventoryController';

const router = Router();
router.use(requireAuth);

router.get('/', getInventory);
router.get('/stats', getInventoryStats);
router.get('/history', getInventoryHistory);
router.post('/:id/favorite', toggleFavorite);
router.post('/debug/add', addItemDebug);

export default router;
