import Boss from '../models/Boss';
import ProgressionProfile from '../models/ProgressionProfile';
import { rewardEngine } from './rewardEngine';
import { dungeonService } from './dungeonService';
import { memoryCrystalService } from './memoryCrystalService';

class BossService {
  async spawnBoss(userId: string, dungeonId: string, name: string, totalHp: number, damagePerMission: number) {
    const boss = await Boss.create({
      userId,
      dungeonId,
      name,
      totalHp,
      currentHp: totalHp,
      damagePerMission,
      isDefeated: false,
      rewards: {
        xp: totalHp * 2,
        coins: totalHp,
        items: ['badge_boss_slayer']
      }
    });
    return boss;
  }

  async damageBoss(userId: string, dungeonId: string) {
    const boss = await Boss.findOne({ userId, dungeonId, isDefeated: false });
    if (!boss) return null;

    boss.currentHp -= boss.damagePerMission;

    let defeated = false;
    if (boss.currentHp <= 0) {
      boss.currentHp = 0;
      boss.isDefeated = true;
      boss.defeatedAt = new Date();
      defeated = true;
    } else {
      const hpPercentage = boss.currentHp / boss.totalHp;
      if (hpPercentage <= 0.3) {
        boss.isEnraged = true;
        boss.phase = 2;
        // Enraged boss takes less damage (simulate difficulty jump)
        // Optionally we can increase damagePerMission, or do nothing.
      }
    }

    await boss.save();

    if (defeated) {
      await this.triggerVictory(userId, boss);
      await dungeonService.clearDungeon(userId, dungeonId);
    }

    return boss;
  }

  async triggerVictory(userId: string, boss: any) {
    // 1. Dispatch Rewards
    await rewardEngine.dispatchReward({
      userId,
      source: 'System',
      reason: `Defeated Boss: ${boss.name}`,
      xp: boss.rewards.xp,
      coins: boss.rewards.coins
    });

    // 2. Update Profile Stats
    await ProgressionProfile.updateOne(
      { userId },
      { $inc: { bossesDefeated: 1 } }
    );

    // 3. Generate Memory Crystal for Museum
    await memoryCrystalService.generateMilestoneCrystal(
      userId,
      'Boss Victory',
      `Slayer of ${boss.name}`,
      `You faced a monumental obstacle and shattered it. The shadows of doubt have cleared.`
    );
  }

  async getActiveBosses(userId: string) {
    return await Boss.find({ userId, isDefeated: false }).populate('dungeonId');
  }
}

export const bossService = new BossService();
