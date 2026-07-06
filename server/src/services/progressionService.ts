import { progressionRepository } from '../repositories/progressionRepository';
import { xpLogRepository } from '../repositories/xpLogRepository';
import { xpRequiredForLevel, getRankForLevel, ACHIEVEMENTS, AchievementConfig } from '../config/progressionConfig';
import { calculateNewStreakState } from '../utils/streakUtil';
import { getCache, setCache, clearCachePattern } from '../config/redis';
import CoinLog from '../models/CoinLog';
import { skillRepository } from '../repositories/skillRepository';

export const hasAwardedToday = async (userId: string, source: string): Promise<boolean> => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  const log = await xpLogRepository.findLogBySourceAndDateRange(userId, source, startOfDay, endOfDay);
  return !!log;
};

export interface XPAwardResult {
  leveledUp: boolean;
  newLevel: number;
  newRank: string;
  rankChanged: boolean;
  newAchievements: Array<{ id: string; name: string; icon: string }>;
}

export const getProgressionProfile = async (userId: string) => {
  const cacheKey = `progression:${userId}`;
  const cachedProfile = await getCache(cacheKey);
  if (cachedProfile) return cachedProfile;

  let profile = await progressionRepository.findByUserId(userId);
  if (!profile) {
    profile = await progressionRepository.create({ userId: userId as any });
  }

  await setCache(cacheKey, profile, 3600);
  return profile;
};

export const checkAchievements = async (userId: string) => {
  let profile = await progressionRepository.findByUserId(userId);
  if (!profile) {
    profile = await progressionRepository.create({ userId: userId as any });
  }

  const newAchievements: Array<{ id: string; name: string; icon: string }> = [];
  const existingAchievementIds = new Set(profile.unlockedAchievements.map(a => a.achievementId));

  // 1. Compile full list of achievements (static + dynamic)
  const allAchievements: AchievementConfig[] = [...ACHIEVEMENTS];

  // Dynamic Skill Achievements
  const skills = await skillRepository.findSkillsByUserId(userId);
  for (const skill of skills) {
    // Explorer
    allAchievements.push({
      id: `skill_explorer_${skill._id}`,
      name: `${skill.name} Explorer`,
      description: `Reach Level 5 in ${skill.name}.`,
      icon: skill.icon || '🎯',
      trigger: async () => skill.level >= 5
    });
    // Master
    allAchievements.push({
      id: `skill_master_${skill._id}`,
      name: `${skill.name} Master`,
      description: `Reach Level 10 in ${skill.name}.`,
      icon: skill.icon || '👑',
      trigger: async () => skill.level >= 10
    });
  }

  const now = new Date();
  let updated = false;

  // 2. Check each un-unlocked achievement
  for (const achievement of allAchievements) {
    if (!existingAchievementIds.has(achievement.id)) {
      const isTriggered = await achievement.trigger(userId, profile);
      if (isTriggered) {
        profile.unlockedAchievements.push({
          achievementId: achievement.id,
          unlockedAt: now
        });
        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          icon: achievement.icon
        });
        updated = true;
      }
    }
  }

  if (updated) {
    await progressionRepository.save(profile);
    await clearCachePattern(`progression:${userId}`);
  }

  return newAchievements;
};

export const awardXP = async (userId: string, source: string, amount: number): Promise<XPAwardResult> => {
  if (amount <= 0) {
    throw new Error('XP amount must be positive');
  }

  let profile = await progressionRepository.findByUserId(userId);
  if (!profile) {
    profile = await progressionRepository.create({ userId: userId as any });
  }

  profile.currentXP += amount;
  profile.totalXP += amount;

  await xpLogRepository.create(userId, source, amount);

  let leveledUp = false;
  const initialLevel = profile.level;
  const initialRank = profile.rank;

  while (profile.currentXP >= xpRequiredForLevel(profile.level)) {
    profile.currentXP -= xpRequiredForLevel(profile.level);
    profile.level += 1;
    leveledUp = true;
  }

  if (leveledUp) {
    profile.rank = getRankForLevel(profile.level);
  }
  const rankChanged = profile.rank !== initialRank;

  const now = new Date();
  const streakState = calculateNewStreakState(
    profile.currentStreak,
    profile.longestStreak,
    profile.lastActiveDate,
    now
  );

  profile.currentStreak = streakState.currentStreak;
  profile.longestStreak = streakState.longestStreak;
  profile.lastActiveDate = streakState.lastActiveDate;

  await progressionRepository.save(profile);
  await clearCachePattern(`progression:${userId}`);

  const newAchievements = await checkAchievements(userId);

  return {
    leveledUp,
    newLevel: profile.level,
    newRank: profile.rank,
    rankChanged,
    newAchievements
  };
};

export interface CoinAwardResult {
  coinsAdded: number;
  totalCoins: number;
}

export const awardCoins = async (userId: string, amount: number, source: string): Promise<CoinAwardResult> => {
  if (amount <= 0) {
    throw new Error('Coin amount must be positive');
  }

  let profile = await progressionRepository.findByUserId(userId);
  if (!profile) {
    profile = await progressionRepository.create({ userId: userId as any });
  }

  profile.coins = (profile.coins || 0) + amount;
  await progressionRepository.save(profile);

  const coinLog = new CoinLog({
    userId,
    amount,
    source
  });
  await coinLog.save();

  await clearCachePattern(`progression:${userId}`);

  return {
    coinsAdded: amount,
    totalCoins: profile.coins
  };
};
