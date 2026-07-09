import _mongoose from 'mongoose';
import _User from '../models/User';
import SleepLog from '../models/SleepLog';
import FoodLog from '../models/FoodLog';
import WaterLog from '../models/WaterLog';
import WorkoutSession from '../models/WorkoutSession';
import WellnessLog from '../models/WellnessLog';
import RecoveryLog from '../models/RecoveryLog';
import { _AppError } from '../utils/AppError';

class RecoveryService {
  /**
   * Calculates and saves the daily recovery score based on the past 24 hours of data.
   */
  async calculateDailyRecovery(userId: string, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Fetch relevant data for the day
    const [sleepLog, foodLogs, waterLogs, workouts, wellnessLog] = await Promise.all([
      SleepLog.findOne({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      FoodLog.find({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      WaterLog.find({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      WorkoutSession.find({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      WellnessLog.findOne({ userId, date: { $gte: startOfDay, $lte: endOfDay } })
    ]);

    // 2. Base Scores
    let sleepScore = 50; // Default if no sleep logged
    let nutritionScore = 50;
    let workoutIntensity = 0;
    let stressPenalty = 0;

    // Sleep calculation
    if (sleepLog) {
      sleepScore = sleepLog.quality; // Use user-provided quality or calc from duration
      // Bonus/Penalty for duration (ideal 7-9 hours)
      const hours = sleepLog.durationMinutes / 60;
      if (hours >= 7 && hours <= 9) sleepScore = Math.min(100, sleepScore + 10);
      else if (hours < 5) sleepScore = Math.max(0, sleepScore - 20);
    }

    // Nutrition Calculation (calories)
    let totalCalories = 0;
    foodLogs.forEach(log => totalCalories += log.nutrients.calories);
    // Simple heuristic: if logged something, boost score. Real app compares to dailyCalorieGoal
    if (totalCalories > 1000) nutritionScore += 20;

    // Hydration Calculation
    let totalWater = 0;
    waterLogs.forEach(log => totalWater += log.amountMl);
    if (totalWater > 2000) nutritionScore += 10;
    if (totalWater > 3000) nutritionScore += 10;
    nutritionScore = Math.min(100, nutritionScore);

    workouts.forEach(w => {
      workoutIntensity += (w.durationMinutes || 45) * (w.totalVolume > 5000 ? 1.5 : w.totalVolume > 2000 ? 1 : 0.5);
    });

    // Stress Calculation
    if (wellnessLog) {
      stressPenalty = (wellnessLog.stress - 5) * 5; // e.g., stress 8 -> penalty 15
    }

    // 3. Composite Recovery Score (0-100)
    // Formula: 50% Sleep + 30% Nutrition - WorkoutFatigue - Stress
    let recoveryScore = (sleepScore * 0.5) + (nutritionScore * 0.3);
    
    // Deduct for high workout intensity without enough sleep
    if (workoutIntensity > 60) {
       recoveryScore -= (workoutIntensity * 0.1);
    }

    recoveryScore -= stressPenalty;

    // Bounds check
    recoveryScore = Math.max(0, Math.min(100, Math.round(recoveryScore)));

    // Readiness & Energy
    const energyScore = Math.min(100, recoveryScore + (wellnessLog?.mood ? wellnessLog.mood * 2 : 0));
    const readinessScore = recoveryScore > 70 ? 100 : recoveryScore > 40 ? 75 : 40;

    // 4. Upsert RecoveryLog
    const recoveryLog = await RecoveryLog.findOneAndUpdate(
      { userId, date: { $gte: startOfDay, $lte: endOfDay } },
      {
        userId,
        date: startOfDay,
        recoveryScore,
        energyScore,
        readinessScore,
        components: {
          sleepScore,
          nutritionScore,
          workoutIntensity,
          stressPenalty
        }
      },
      { upsert: true, new: true }
    );

    return recoveryLog;
  }
}

export const recoveryService = new RecoveryService();
