import _mongoose from 'mongoose';
import MissionTemplate from '../models/MissionTemplate';
import logger from '../utils/logger';

export const seedDefaultMissions = async (userId: string) => {
  const existing = await MissionTemplate.countDocuments({ userId });
  if (existing > 0) return; // Already seeded

  logger.info(`Seeding default mission templates for user ${userId}`);

  // Base Templates
  const wakeUp = await new MissionTemplate({
    userId, title: 'Wake Before 6 AM', description: 'Early start for maximum productivity',
    icon: 'sunrise', category: 'discipline', baseDifficulty: 3, scalingFactor: 1.0, baseXP: 30
  }).save();

  const morningWorkout = await new MissionTemplate({
    userId, title: 'Morning Workout', description: 'At least 30 minutes of physical activity',
    icon: 'dumbbell', category: 'fitness', baseDifficulty: 5, scalingFactor: 1.1, baseXP: 50,
    prerequisites: [wakeUp._id]
  }).save();

  const proteinBreakfast = await new MissionTemplate({
    userId, title: 'High Protein Breakfast', description: 'Fuel up for the day ahead',
    icon: 'beef', category: 'nutrition', baseDifficulty: 2, scalingFactor: 1.0, baseXP: 20,
    prerequisites: [morningWorkout._id]
  }).save();

  const _deepWork = await new MissionTemplate({
    userId, title: 'Deep Work Session', description: '90 minutes of focused work',
    icon: 'brain', category: 'career', baseDifficulty: 6, scalingFactor: 1.2, baseXP: 100,
    prerequisites: [proteinBreakfast._id]
  }).save();

  // Hidden/Emergency/Bonus
  await new MissionTemplate({
    userId, title: 'Drink Water', description: 'Hydrate immediately!',
    icon: 'droplets', category: 'recovery', baseDifficulty: 1, baseXP: 10, isEmergency: true
  }).save();

  await new MissionTemplate({
    userId, title: 'No Social Media', description: 'A day of digital detox',
    icon: 'smartphone-off', category: 'discipline', baseDifficulty: 8, baseXP: 200, isHidden: true
  }).save();

  await new MissionTemplate({
    userId, title: 'Bonus: Read 10 Pages', description: 'Expand your mind',
    icon: 'book', category: 'study', baseDifficulty: 4, baseXP: 50, isBonus: true
  }).save();
};
