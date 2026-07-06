import Habit, { IHabit } from '../models/Habit';
import HabitCompletion, { IHabitCompletion } from '../models/HabitCompletion';
import { UpdateQuery } from 'mongoose';

export const habitRepository = {
  findActiveHabitsByUserId: async (userId: any): Promise<IHabit[]> => {
    return Habit.find({ userId, active: true }).sort({ createdAt: 1 });
  },

  findByIdAndUserId: async (id: string, userId: string): Promise<IHabit | null> => {
    return Habit.findOne({ _id: id, userId, active: true });
  },

  insertMany: async (habits: any[]): Promise<IHabit[]> => {
    return Habit.insertMany(habits) as unknown as IHabit[];
  },

  create: async (data: Partial<IHabit>): Promise<IHabit> => {
    return Habit.create(data);
  },

  update: async (id: string, userId: string, updates: UpdateQuery<IHabit>): Promise<IHabit | null> => {
    return Habit.findOneAndUpdate({ _id: id, userId }, updates, { new: true, runValidators: true });
  },

  softDelete: async (id: string, userId: string): Promise<IHabit | null> => {
    return Habit.findOneAndUpdate({ _id: id, userId }, { active: false }, { new: true });
  },

  save: async (habit: IHabit): Promise<IHabit> => {
    return habit.save();
  },

  // Completion logic
  findCompletionsByDate: async (userId: any, date: string): Promise<IHabitCompletion[]> => {
    return HabitCompletion.find({ userId, date });
  },

  findCompletionsFromDate: async (userId: string, habitId: string, cutoffDate: Date): Promise<IHabitCompletion[]> => {
    return HabitCompletion.find({
      userId,
      habitId,
      completedAt: { $gte: cutoffDate }
    }).sort({ date: 1 });
  },

  createCompletion: async (userId: string, habitId: string, date: string, completedAt: Date): Promise<IHabitCompletion> => {
    return HabitCompletion.create({ userId, habitId, date, completedAt });
  }
};
