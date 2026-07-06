import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { nutritionService } from '../services/nutritionService';
import * as aiNutritionService from '../services/nutritionAiService';
import { missionService } from '../services/missionService';
import { AppError } from '../utils/AppError';

const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_APP_KEY = process.env.NUTRITIONIX_APP_KEY;

export const searchFood = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query.q as string;
  if (!query) throw new AppError('Search query is required', 400);

  const results = await nutritionService.searchFoodDatabase(query);
  res.status(200).json({ success: true, foods: results });
});

export const analyzeFood = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  if (!text) throw new AppError('Food input text is required', 400);

  const result = await aiNutritionService.analyzeFoodInput(text);
  res.status(200).json({ success: true, data: result });
});

export const parseFood = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query } = req.body;
  if (!query) throw new AppError('Query is required', 400);

  if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_APP_KEY) {
    console.warn('Nutritionix API keys missing. Using mock parsing.');
    res.status(200).json({
      success: true,
      foods: nutritionService.parseFoodMock(query)
    });
    return;
  }

  const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-id': NUTRITIONIX_APP_ID,
      'x-app-key': NUTRITIONIX_APP_KEY,
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new AppError('Failed to parse food via Nutritionix', 400);
  }

  const data = await response.json();
  res.status(200).json({ success: true, foods: data.foods });
});

export const logFood = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await nutritionService.logFood(req.user!.id, req.body);
  
  const newlyCompletedQuests = await missionService.refreshDailyQuests(req.user!.id);
  const newlyDefeatedBoss = await missionService.refreshWeeklyBoss(req.user!.id);

  res.status(201).json({ success: true, ...result, newlyCompletedQuests, newlyDefeatedBoss });
});

export const logManualFood = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await nutritionService.logManualFood(req.user!.id, req.body);
  
  const newlyCompletedQuests = await missionService.refreshDailyQuests(req.user!.id);
  const newlyDefeatedBoss = await missionService.refreshWeeklyBoss(req.user!.id);

  res.status(201).json({ success: true, ...result, newlyCompletedQuests, newlyDefeatedBoss });
});

export const getFoodLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const logs = await nutritionService.getFoodLogs(req.user!.id, req.query.date as string);
  res.status(200).json({ success: true, logs });
});

export const deleteFoodLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  await nutritionService.deleteFoodLog(req.params.id, req.user!.id);
  res.status(200).json({ success: true });
});

export const getNutritionSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await nutritionService.getNutritionSummary(req.user!.id, req.query.range);
  res.status(200).json({ success: true, summary });
});

export const logWater = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await nutritionService.logWater(req.user!.id, req.body.amountMl);
  
  const newlyCompletedQuests = await missionService.refreshDailyQuests(req.user!.id);
  const newlyDefeatedBoss = await missionService.refreshWeeklyBoss(req.user!.id);

  res.status(201).json({ success: true, ...result, newlyCompletedQuests, newlyDefeatedBoss });
});

export const getWater = asyncHandler(async (req: AuthRequest, res: Response) => {
  const totalWaterMl = await nutritionService.getWater(req.user!.id, req.query.date as string);
  res.status(200).json({ success: true, totalWaterMl });
});
