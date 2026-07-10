import { xpLogRepository } from '../repositories/xpLogRepository';
import { getProgressionProfile } from './progressionService';
import { getRankForLevel, RANK_TABLE, xpRequiredForLevel } from '../config/progressionConfig';

export const getProgressionPrediction = async (userId: string) => {
  const profile = await getProgressionProfile(userId);
  const history = await xpLogRepository.getAggregatedHistory(userId, 7);
  
  // Calculate 7-day trailing average XP
  let totalTrailingXP = 0;
  for (const day of history) {
    totalTrailingXP += day.totalXP || 0;
  }
  
  const averageDailyXP = Math.max(1, totalTrailingXP / 7); // Floor at 1 to avoid Infinity
  
  // Next Level Prediction
  const xpForNextLevel = xpRequiredForLevel(profile.level);
  const xpNeededForLevel = Math.max(0, xpForNextLevel - profile.currentXP);
  const daysToNextLevel = Math.ceil(xpNeededForLevel / averageDailyXP);

  // Next Rank Prediction (Simplified: assume they meet streak requirements organically, predict purely based on XP/Level trajectory)
  const currentRankIndex = RANK_TABLE.findIndex(r => r.name === profile.rank);
  const nextRank = currentRankIndex < RANK_TABLE.length - 1 ? RANK_TABLE[currentRankIndex + 1] : null;
  
  let daysToNextRank = -1;
  
  if (nextRank) {
    // How many levels to hit next rank?
    const levelsNeeded = Math.max(0, nextRank.minLevel - profile.level);
    
    if (levelsNeeded === 0) {
      // Just waiting on streak
      const streakNeeded = Math.max(0, (nextRank.minStreak || 0) - profile.currentStreak);
      daysToNextRank = streakNeeded;
    } else {
      // Very rough estimation: (current level req * levels needed) / daily average
      // Accurate would require integrating the xp curve, but this is an estimate
      const avgXPPerLevel = xpForNextLevel * 1.5; // roughly increasing
      const totalXPNeededForRank = avgXPPerLevel * levelsNeeded;
      daysToNextRank = Math.ceil(totalXPNeededForRank / averageDailyXP);
    }
  }

  return {
    averageDailyXP: Math.round(averageDailyXP),
    daysToNextLevel,
    daysToNextRank: daysToNextRank,
    nextRank: nextRank ? nextRank.name : 'MAX',
    monthlyPrediction: Math.round(averageDailyXP * 30)
  };
};
