import _mongoose from 'mongoose';
import User from '../models/User';
import SleepLog from '../models/SleepLog';
import WellnessLog from '../models/WellnessLog';
import WeightLog from '../models/WeightLog';
import RecoveryLog from '../models/RecoveryLog';
import { recoveryService } from './recoveryService';
import { _AppError } from '../utils/AppError';

class HealthService {
  async logSleep(userId: string, data: any) {
    const sleepLog = await SleepLog.create({
      userId,
      date: data.date || new Date(),
      durationMinutes: data.durationMinutes,
      quality: data.quality,
      bedTime: data.bedTime,
      wakeTime: data.wakeTime,
      sleepDebt: data.sleepDebt || 0
    });
    
    // Recalculate recovery score
    await recoveryService.calculateDailyRecovery(userId, sleepLog.date);
    return sleepLog;
  }

  async logWellness(userId: string, data: any) {
    const wellnessLog = await WellnessLog.create({
      userId,
      date: data.date || new Date(),
      mood: data.mood,
      stress: data.stress,
      focus: data.focus,
      meditationMinutes: data.meditationMinutes || 0,
      breathingMinutes: data.breathingMinutes || 0,
      notes: data.notes
    });

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
}

export const healthService = new HealthService();
