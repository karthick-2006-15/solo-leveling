import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { inventoryService } from '../services/inventoryService';

export const getInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await inventoryService.getInventory(req.user!.id, req.query);
    res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    next(error);
  }
};

export const getInventoryStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await inventoryService.getInventoryStats(req.user!.id);
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};

export const getInventoryHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = await inventoryService.getInventoryHistory(req.user!.id);
    res.status(200).json({ status: 'success', data: history });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.toggleFavorite(req.user!.id, req.params.id);
    res.status(200).json({ status: 'success', data: item });
  } catch (error) {
    next(error);
  }
};

export const addItemDebug = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // DEBUG ONLY: Remove or restrict in production
  try {
    const item = await inventoryService.addItem({
      userId: req.user!.id,
      ...req.body
    });
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    next(error);
  }
};
