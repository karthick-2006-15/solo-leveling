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
  }
};
