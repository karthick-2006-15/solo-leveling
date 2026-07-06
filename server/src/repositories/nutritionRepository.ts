import FoodLog, { IFoodLog } from '../models/FoodLog';
import WaterLog, { IWaterLog } from '../models/WaterLog';

export const nutritionRepository = {
  createFoodLog: async (data: Partial<IFoodLog>): Promise<IFoodLog> => {
    return FoodLog.create(data);
  },

  findFoodLogsByDateRange: async (userId: string, start: Date, end: Date): Promise<IFoodLog[]> => {
    return FoodLog.find({ userId, date: { $gte: start, $lte: end } }).sort({ createdAt: 1 });
  },

  deleteFoodLog: async (id: string, userId: string): Promise<IFoodLog | null> => {
    return FoodLog.findOneAndDelete({ _id: id, userId });
  },

  findFoodLogsFromDate: async (userId: string, cutoffDate: Date): Promise<IFoodLog[]> => {
    return FoodLog.find({ userId, date: { $gte: cutoffDate } });
  },

  createWaterLog: async (data: Partial<IWaterLog>): Promise<IWaterLog> => {
    return WaterLog.create(data);
  },

  findWaterLogsByDateRange: async (userId: string, start: Date, end: Date): Promise<IWaterLog[]> => {
    return WaterLog.find({ userId, date: { $gte: start, $lte: end } });
  }
};
