import MemoryCrystal from '../models/MemoryCrystal';
import ProgressionProfile from '../models/ProgressionProfile';

class MemoryCrystalService {
  async generateMilestoneCrystal(userId: string, type: string, title: string, ariaMessage: string) {
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) return;

    // Check if crystal already exists to prevent duplicate milestones
    const existing = await MemoryCrystal.findOne({ userId, milestoneType: type });
    if (existing) return;

    await MemoryCrystal.create({
      userId,
      title,
      milestoneType: type,
      levelSnapshot: profile.level,
      rankSnapshot: profile.rank,
      statsSnapshot: {
        totalXP: profile.totalXP,
        longestStreak: profile.longestStreak
      },
      badgeIcon: 'Sparkles',
      ariaMessage
    });
  }

  async getCrystals(userId: string) {
    return await MemoryCrystal.find({ userId }).sort({ date: -1 });
  }
}

export const memoryCrystalService = new MemoryCrystalService();
