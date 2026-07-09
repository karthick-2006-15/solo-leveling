import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  getShopItems, purchaseItem, openChest, equipRelic, unequipRelic, 
  triggerPrestige, getActiveEvents, getMemoryCrystals 
} from '../controllers/rewardController';

const router = Router();
router.use(requireAuth);

router.get('/shop', getShopItems);
router.post('/shop/:itemId/purchase', purchaseItem);

router.post('/chest/:chestId/open', openChest);

router.post('/relic/:itemDocId/equip', equipRelic);
router.post('/relic/:itemDocId/unequip', unequipRelic);

router.post('/prestige', triggerPrestige);

router.get('/events', getActiveEvents);

router.get('/museum', getMemoryCrystals);

export default router;
