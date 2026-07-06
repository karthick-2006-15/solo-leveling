import mongoose from 'mongoose';
import { habitRepository } from '../repositories/habitRepository';
import { awardXP } from '../services/progressionService';
import { calculateNewStreakState } from '../utils/streakUtil';
import { AppError } from '../utils/AppError';

const DEFAULT_HABITS = [
  { name: 'Wake Up Early', icon: '🌅', xpValue: 20 },
  { name: 'Sleep Before 11PM', icon: '🌙', xpValue: 20 },
  { name: 'Drink Water', icon: '💧', xpValue: 20 },
  { name: 'Read', icon: '📚', xpValue: 40 },
  { name: 'Meditate', icon: '🧘', xpValue: 30 },
  { name: 'Study', icon: '🧠', xpValue: 80 },
  { name: 'Journal', icon: '📓', xpValue: 20 },
  { name: 'Stretch', icon: '🤸', xpValue: 20 },
];

export const habitService = {
  getHabitsWithTodayStatus: async (userIdStr: string) => {
    const userId = new mongoose.Types.ObjectId(userIdStr);
    
    let habits = await habitRepository.findActiveHabitsByUserId(userId);

    if (habits.length === 0) {
      const seededHabits = DEFAULT_HABITS.map(h => ({
        ...h,
        userId,
        isDefault: true,
        active: true,
      }));
      habits = await habitRepository.insertMany(seededHabits);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const completionsToday = await habitRepository.findCompletionsByDate(userId, todayStr);
    const completedIds = new Set(completionsToday.map(c => c.habitId.toString()));

    return habits.map(h => ({
      ...h.toObject(),
      completedToday: completedIds.has(h._id.toString())
    }));
  },

  createHabit: async (userId: string, data: any) => {
    return habitRepository.create({ ...data, userId, isDefault: false, xpValue: data.xpValue || 20 });
  },

  updateHabit: async (id: string, userId: string, data: any) => {
    const habit = await habitRepository.update(id, userId, data);
    if (!habit) throw new AppError('Habit not found', 404);
    return habit;
  },

  deleteHabit: async (id: string, userId: string) => {
    const habit = await habitRepository.softDelete(id, userId);
    if (!habit) throw new AppError('Habit not found', 404);
    return habit;
  },

  completeHabit: async (habitId: string, userId: string) => {
    const habit = await habitRepository.findByIdAndUserId(habitId, userId);
    if (!habit) throw new AppError('Habit not found', 404);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    try {
      await habitRepository.createCompletion(userId, habitId, dateStr, now);
    } catch (err: any) {
      if (err.code === 11000) {
        throw new AppError('Already completed today', 400);
      }
      throw err;
    }

    const streakState = calculateNewStreakState(
      habit.currentStreak,
      habit.longestStreak,
      habit.lastCompletedDate,
      now
    );

    habit.currentStreak = streakState.currentStreak;
    habit.longestStreak = streakState.longestStreak;
    habit.lastCompletedDate = streakState.lastActiveDate;
    await habitRepository.save(habit);

    const xpResult = await awardXP(userId, `habit_completed:${habitId}`, habit.xpValue);

    return { habit, xpResult };
  },

  getHabitHistory: async (habitId: string, userId: string, range: any) => {
    const days = range === 'month' ? 30 : 7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const completions = await habitRepository.findCompletionsFromDate(userId, habitId, cutoff);
    return completions.map(c => c.date);
  }
};
