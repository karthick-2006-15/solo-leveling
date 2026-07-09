import ProgressionProfile from '../models/ProgressionProfile';
import { inventoryService } from './inventoryService';
import MemoryCrystal from '../models/MemoryCrystal';

class PrestigeService {
  async prestigeHunter(userId: string) {
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) throw new Error("Profile not found.");

    // Prestige requirement: Level 100
    if (profile.level < 100) {
      throw new Error(`Level 100 required to prestige. Current level: ${profile.level}`);
    }

    // 1. Generate Memory Crystal (Museum Entry)
    await MemoryCrystal.create({
      userId,
      title: `Prestige ${profile.prestigeLevel + 1} Awakened`,
      milestoneType: 'Prestige',
      levelSnapshot: profile.level,
      rankSnapshot: profile.rank,
      statsSnapshot: {
        totalXP: profile.totalXP,
        lifetimeCoinsEarned: profile.lifetimeCoinsEarned,
        missionsCompleted: profile.hunterScore
      },
      badgeIcon: 'Crown',
      ariaMessage: `A Hunter must always grow. You have broken your limits ${profile.prestigeLevel + 1} times.`
    });

    // 2. Grant Prestige Badge to Inventory
    await inventoryService.addItem({
      userId,
      itemId: `badge_prestige_${profile.prestigeLevel + 1}`,
      name: `Prestige ${profile.prestigeLevel + 1} Vanguard`,
      type: 'badge',
      category: 'Badge',
      rarity: 'Mythic',
      icon: 'Crown',
      description: `A symbol of breaking the mortal limits ${profile.prestigeLevel + 1} times.`,
      source: 'Prestige System'
    });

    // 3. Reset Stats
    profile.prestigeLevel += 1;
    profile.prestigePoints += 1;
    profile.level = 1;
    profile.currentXP = 0;
    // We do NOT reset totalXP, lifetimeCoins, or Inventory.

    await profile.save();

    return { success: true, prestigeLevel: profile.prestigeLevel };
  }
}

export const prestigeService = new PrestigeService();
