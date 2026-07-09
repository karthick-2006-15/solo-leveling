import ProgressionProfile from '../models/ProgressionProfile';
import { eventService } from './eventService';

export class LuckService {
  async calculateHunterLuck(userId: string): Promise<number> {
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) return 100; // Base luck

    let luck = profile.luckBase || 100;

    // 1. Rank Bonus
    const rankBonuses: Record<string, number> = {
      'Beginner': 0,
      'E-Rank': 5,
      'D-Rank': 10,
      'C-Rank': 15,
      'B-Rank': 25,
      'A-Rank': 40,
      'S-Rank': 60,
      'National Level': 100
    };
    luck += rankBonuses[profile.rank] || 0;

    // 2. Streak Bonus
    if (profile.currentStreak >= 7) luck += 5;
    if (profile.currentStreak >= 30) luck += 10;
    if (profile.currentStreak >= 100) luck += 25;

    // 3. Pity Bonus
    const pity = profile.pityCounter || 0;
    luck += pity * 2; // Every failed rare roll adds +2 to luck

    // 4. World Event Bonus
    const modifiers = await eventService.getActiveModifiers();
    luck += modifiers.luckBonus;

    // (Relic bonus would be integrated here if we fetch relics)
    return luck;
  }

  async incrementPity(userId: string) {
    await ProgressionProfile.updateOne(
      { userId },
      { $inc: { pityCounter: 1 } }
    );
  }

  async resetPity(userId: string) {
    await ProgressionProfile.updateOne(
      { userId },
      { $set: { pityCounter: 0 } }
    );
  }
}

export const luckService = new LuckService();
