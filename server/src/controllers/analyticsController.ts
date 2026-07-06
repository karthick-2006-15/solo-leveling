import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { bucketAndAggregate, Granularity } from '../utils/analyticsUtil';
import WeightLog from '../models/WeightLog';
import FoodLog from '../models/FoodLog';
import WaterLog from '../models/WaterLog';
import WorkoutSession from '../models/WorkoutSession';
import PersonalRecord from '../models/PersonalRecord';
import HabitCompletion from '../models/HabitCompletion';
import DSAProblem from '../models/DSAProblem';
import XPLog from '../models/XPLog';
import { AppError } from '../utils/AppError';

export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { metric } = req.params;
  const granularity = (req.query.granularity as Granularity) || 'day';
  const exercise = req.query.exercise as string;
  const habitId = req.query.habitId as string;
  const userId = req.user?.id;

  if (!userId) throw new AppError('Unauthorized', 401);

  let rawData: any[];
  let dateField = 'loggedAt';
  let aggregation: 'sum' | 'max' | 'average' | 'count';
  let valueExtractor: (item: any) => number = () => 1;

  switch (metric) {
    case 'weight':
      rawData = await WeightLog.find({ userId }).sort({ loggedAt: 1 }).lean();
      aggregation = 'max'; // latest or max in the bucket
      valueExtractor = (item) => item.weight;
      break;
    
    case 'calories':
      rawData = await FoodLog.find({ userId }).sort({ loggedAt: 1 }).lean();
      aggregation = 'sum';
      valueExtractor = (item) => item.calories;
      break;
    
    case 'protein':
      rawData = await FoodLog.find({ userId }).sort({ loggedAt: 1 }).lean();
      aggregation = 'sum';
      valueExtractor = (item) => item.protein;
      break;

    case 'water':
      rawData = await WaterLog.find({ userId }).sort({ loggedAt: 1 }).lean();
      aggregation = 'sum';
      valueExtractor = (item) => item.amountMl;
      break;

    case 'workout_volume':
      rawData = await WorkoutSession.find({ userId }).sort({ date: 1 }).lean();
      dateField = 'date';
      aggregation = 'sum';
      valueExtractor = (item) => item.totalVolume || 0;
      break;

    case 'strength':
      if (!exercise) throw new AppError('Exercise parameter is required for strength metric', 400);
      rawData = await PersonalRecord.find({ userId, exerciseName: exercise }).sort({ date: 1 }).lean();
      dateField = 'date';
      aggregation = 'max';
      valueExtractor = (item) => item.weight || 0;
      break;

    case 'sleep_habit_rate':
      // Fetch all sleep habit completions
      rawData = await HabitCompletion.find({ userId, habitKey: 'sleep_before_11pm' }).sort({ completedAt: 1 }).lean();
      dateField = 'completedAt';
      aggregation = 'count'; 
      // To calculate percentage, we would need to know the total days in the bucket.
      // We will just return the count of completions in that bucket (e.g., max 7 in a week) 
      // to keep it simple, or calculate percentage if we want.
      break;

    case 'habit_completion': {
      const query: any = { userId };
      if (habitId && habitId !== 'all') {
        query.habitId = habitId;
      }
      rawData = await HabitCompletion.find(query).sort({ completedAt: 1 }).lean();
      dateField = 'completedAt';
      aggregation = 'count';
      break;
    }

    case 'dsa_problems':
      rawData = await DSAProblem.find({ userId }).sort({ dateSolved: 1 }).lean();
      dateField = 'dateSolved';
      aggregation = 'count';
      break;

    case 'xp_growth':
      rawData = await XPLog.find({ userId }).sort({ date: 1 }).lean();
      dateField = 'date';
      aggregation = 'sum';
      valueExtractor = (item) => item.amount;
      break;

    default:
      throw new AppError(`Unsupported metric: ${metric}`, 400);
  }

  const bucketedData = bucketAndAggregate(rawData, dateField, granularity, aggregation, valueExtractor);

  // For cumulative sum (like XP growth), we need to accumulate the buckets
  if (metric === 'xp_growth') {
    let currentTotal = 0;
    for (let i = 0; i < bucketedData.length; i++) {
      currentTotal += bucketedData[i].value;
      bucketedData[i].value = currentTotal;
    }
  }

  res.status(200).json({ success: true, data: bucketedData });
});
