import _mongoose from 'mongoose';
import User from '../models/User';
import SleepLog from '../models/SleepLog';
import WellnessLog from '../models/WellnessLog';
import WeightLog from '../models/WeightLog';
import RecoveryLog from '../models/RecoveryLog';
import WaterLog from '../models/WaterLog';
import FoodLog from '../models/FoodLog';
import { recoveryService } from './recoveryService';
import { AppError } from '../utils/AppError';

class HealthService {
  async logSleep(userId: string, data: any) {
    const targetDate = data.date ? new Date(data.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    let sleepLog = await SleepLog.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (sleepLog) {
      sleepLog.durationMinutes = data.durationMinutes;
      sleepLog.quality = data.quality;
      sleepLog.bedTime = data.bedTime;
      sleepLog.wakeTime = data.wakeTime;
      sleepLog.sleepDebt = data.sleepDebt || 0;
      await sleepLog.save();
    } else {
      sleepLog = await SleepLog.create({
        userId,
        date: startOfDay,
        durationMinutes: data.durationMinutes,
        quality: data.quality,
        bedTime: data.bedTime,
        wakeTime: data.wakeTime,
        sleepDebt: data.sleepDebt || 0
      });
    }
    
    // Recalculate recovery score
    await recoveryService.calculateDailyRecovery(userId, sleepLog.date);
    return sleepLog;
  }

  async logWellness(userId: string, data: any) {
    const targetDate = data.date ? new Date(data.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    let wellnessLog = await WellnessLog.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (wellnessLog) {
      wellnessLog.mood = data.mood;
      wellnessLog.stress = data.stress;
      wellnessLog.focus = data.focus;
      wellnessLog.meditationMinutes = data.meditationMinutes || 0;
      wellnessLog.breathingMinutes = data.breathingMinutes || 0;
      wellnessLog.notes = data.notes;
      await wellnessLog.save();
    } else {
      wellnessLog = await WellnessLog.create({
        userId,
        date: startOfDay,
        mood: data.mood,
        stress: data.stress,
        focus: data.focus,
        meditationMinutes: data.meditationMinutes || 0,
        breathingMinutes: data.breathingMinutes || 0,
        notes: data.notes
      });
    }

    // Recalculate recovery score
    await recoveryService.calculateDailyRecovery(userId, wellnessLog.date);
    return wellnessLog;
  }

  async logBodyMetrics(userId: string, data: any) {
    const log = await WeightLog.create({
      userId,
      weight: data.weight,
      bodyFatPercent: data.bodyFatPercent,
      leanMass: data.leanMass,
      fatMass: data.fatMass,
      measurements: data.measurements,
      loggedAt: data.loggedAt || new Date()
    });

    // Update user profile if weight is provided
    if (data.weight || data.bodyFatPercent) {
       const updateData: any = {};
       if (data.weight) updateData.weight = data.weight;
       if (data.bodyFatPercent) updateData.bodyFatPercent = data.bodyFatPercent;
       await User.findByIdAndUpdate(userId, updateData);
    }
    return log;
  }

  async getHealthAnalytics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [sleepData, recoveryData, wellnessData, weightData] = await Promise.all([
      SleepLog.find({ userId, date: { $gte: startDate } }).sort({ date: 1 }),
      RecoveryLog.find({ userId, date: { $gte: startDate } }).sort({ date: 1 }),
      WellnessLog.find({ userId, date: { $gte: startDate } }).sort({ date: 1 }),
      WeightLog.find({ userId, loggedAt: { $gte: startDate } }).sort({ loggedAt: 1 })
    ]);

    return {
      sleepTrend: sleepData,
      recoveryTrend: recoveryData,
      wellnessTrend: wellnessData,
      weightTrend: weightData
    };
  }

  async getTodayStatus(userId: string, targetDateStr?: string) {
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [sleepLog, wellnessLog, recoveryLog, waterLogs, foodLogs] = await Promise.all([
      SleepLog.findOne({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      WellnessLog.findOne({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      RecoveryLog.findOne({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      WaterLog.find({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      FoodLog.find({ userId, date: { $gte: startOfDay, $lte: endOfDay } })
    ]);

    const totalWaterMl = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);
    const totalCalories = foodLogs.reduce((sum, log) => sum + log.nutrients.calories, 0);

    return {
      sleepLog,
      wellnessLog,
      recoveryLog,
      hydrationMl: totalWaterMl,
      caloriesKcal: totalCalories
    };
  }
}

export const healthService = new HealthService();
