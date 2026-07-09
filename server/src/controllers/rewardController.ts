import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { shopService } from '../services/shopService';
import { chestService } from '../services/chestService';
import { relicService } from '../services/relicService';
import { prestigeService } from '../services/prestigeService';
import { eventService } from '../services/eventService';
import { memoryCrystalService } from '../services/memoryCrystalService';

// Shop
export const getShopItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await shopService.getShopItems();
    res.status(200).json({ status: 'success', data: items });
  } catch (error) { next(error); }
};

export const purchaseItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await shopService.purchaseItem(req.user!.id, req.params.itemId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

// Chest
export const openChest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await chestService.openChest(req.user!.id, req.params.chestId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

// Relics
export const equipRelic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await relicService.equipRelic(req.user!.id, req.params.itemDocId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

export const unequipRelic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await relicService.unequipRelic(req.user!.id, req.params.itemDocId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

// Prestige
export const triggerPrestige = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await prestigeService.prestigeHunter(req.user!.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

// World Events
export const getActiveEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const events = await eventService.getActiveEvents();
    res.status(200).json({ status: 'success', data: events });
  } catch (error) { next(error); }
};

// Memory Crystals / Museum
export const getMemoryCrystals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const crystals = await memoryCrystalService.getCrystals(req.user!.id);
    res.status(200).json({ status: 'success', data: crystals });
  } catch (error) { next(error); }
};
