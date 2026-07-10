import mongoose from 'mongoose';
import XPLog, { IXPLog } from '../models/XPLog';

export const xpLogRepository = {
  findLogBySourceAndDateRange: async (userId: string, source: string, start: Date, end: Date): Promise<IXPLog | null> => {
    return XPLog.findOne({
      userId,
      source,
      createdAt: { $gte: start, $lte: end }
    });
  },

  create: async (userId: string, source: string, amount: number): Promise<IXPLog> => {
    return XPLog.create({ userId, source, amount });
  },

  getAggregatedHistory: async (userId: string, days: number = 7): Promise<Array<{ _id: string; totalXP: number }>> => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    return XPLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalXP: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ]);
  }
};
