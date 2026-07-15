import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { screenTimeService } from '../services/screenTimeService';
import { AppError } from '../utils/AppError';

export const getDashboardData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await screenTimeService.getDashboardData(req.user!.id);
  res.status(200).json({ success: true, data });
});

export const logManualScreenTime = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { totalTimeMinutes, apps } = req.body;
  if (!apps || !Array.isArray(apps)) {
    throw new AppError('Invalid request format', 400);
  }
  const result = await screenTimeService.processScreenTime(req.user!.id, { totalTimeMinutes, apps });
  res.status(200).json({ success: true, ...result });
});

export const analyzeImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { base64Image, mimeType } = req.body;
  if (!base64Image) {
    throw new AppError('Image is required', 400);
  }
  const result = await screenTimeService.processImageUpload(req.user!.id, base64Image, mimeType);
  res.status(200).json({ success: true, ...result });
});

export const getClassifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const classifications = await screenTimeService.getAppClassifications(req.user!.id);
  res.status(200).json({ success: true, classifications });
});

export const updateClassification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { category } = req.body;
  const classification = await screenTimeService.updateAppClassification(req.user!.id, id, category);
  res.status(200).json({ success: true, classification });
});
