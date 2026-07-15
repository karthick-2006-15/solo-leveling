import RecoveryProfile, { IRecoveryProfile } from '../models/RecoveryProfile';
import LustBoss, { ILustBoss } from '../models/LustBoss';
import GuardianLog, { GuardianActionType } from '../models/GuardianLog';
import { differenceInDays, startOfDay } from 'date-fns';

export class GuardianService {
  async getProfile(userId: string): Promise<IRecoveryProfile> {
    let profile = await RecoveryProfile.findOne({ userId });
    if (!profile) {
      profile = await RecoveryProfile.create({ userId });
    }
    
    // Update streak based on last relapse
    if (profile.lastRelapseDate) {
      const daysSince = differenceInDays(startOfDay(new Date()), startOfDay(profile.lastRelapseDate));
      if (daysSince !== profile.currentStreak) {
        profile.currentStreak = Math.max(0, daysSince);
        if (profile.currentStreak > profile.longestStreak) {
          profile.longestStreak = profile.currentStreak;
        }
        await profile.save();
      }
    } else {
      // If no relapse recorded, count from profile creation
      const daysSince = differenceInDays(startOfDay(new Date()), startOfDay((profile as any).createdAt));
      if (daysSince !== profile.currentStreak) {
         profile.currentStreak = Math.max(0, daysSince);
         if (profile.currentStreak > profile.longestStreak) {
           profile.longestStreak = profile.currentStreak;
         }
         await profile.save();
      }
    }
    
    // Reset morning oath if new day
    if (profile.morningOathDate && startOfDay(profile.morningOathDate) < startOfDay(new Date())) {
      profile.morningOathAccepted = false;
      await profile.save();
    }

    return profile;
  }

  async getBoss(userId: string): Promise<ILustBoss> {
    let boss = await LustBoss.findOne({ userId });
    if (!boss) {
      boss = await LustBoss.create({ userId });
    }
    return boss;
  }

  async acceptMorningOath(userId: string): Promise<void> {
    const profile = await this.getProfile(userId);
    profile.morningOathAccepted = true;
    profile.morningOathDate = new Date();
    await profile.save();
    await GuardianLog.create({ userId, actionType: 'morning_oath' });
  }

  async processRelapse(userId: string, emotion?: string, triggerContext?: string): Promise<{ profile: IRecoveryProfile, boss: ILustBoss }> {
    const profile = await this.getProfile(userId);
    const boss = await this.getBoss(userId);

    // Apply penalties
    profile.lastRelapseDate = new Date();
    profile.currentStreak = 0;
    profile.willpower = Math.max(0, profile.willpower - 30);
    profile.corruption = Math.min(100, profile.corruption + 25);
    
    // Boss Heals 100% of Max HP (fully restored)
    boss.currentHp = boss.maxHp;

    await profile.save();
    await boss.save();
    await GuardianLog.create({ userId, actionType: 'relapse', emotion, triggerContext });

    return { profile, boss };
  }

  async processRecoveryAction(
    userId: string, 
    actionType: GuardianActionType, 
    durationMinutes: number = 0,
    emotion?: string,
    triggerContext?: string
  ): Promise<{ profile: IRecoveryProfile, boss: ILustBoss }> {
    const profile = await this.getProfile(userId);
    const boss = await this.getBoss(userId);

    if (actionType === 'urge_resisted') {
      profile.urgesResisted += 1;
      profile.willpower = Math.min(100, profile.willpower + 5);
      boss.currentHp -= 10;
    } else if (actionType === 'dungeon_completed') {
      profile.recoveryMissionsCompleted += 1;
      profile.willpower = Math.min(100, profile.willpower + 15);
      profile.corruption = Math.max(0, profile.corruption - 10);
      boss.currentHp -= Math.max(50, durationMinutes * 5);
    } else if (actionType === 'safe_mode_completed') {
      profile.safeModeSessionsCompleted += 1;
      profile.willpower = Math.min(100, profile.willpower + 10);
      profile.corruption = Math.max(0, profile.corruption - 5);
      boss.currentHp -= Math.max(30, durationMinutes * 2);
    }

    // Check boss defeat
    if (boss.currentHp <= 0) {
      boss.defeatedCount += 1;
      boss.level += 1;
      boss.maxHp = Math.floor(boss.maxHp * 1.5);
      boss.currentHp = boss.maxHp;
      profile.corruption = Math.max(0, profile.corruption - 20); // Bonus cleanse
    }

    await profile.save();
    await boss.save();
    await GuardianLog.create({ userId, actionType, durationMinutes, emotion, triggerContext });

    return { profile, boss };
  }

  async getRecentLogs(userId: string, limit = 50) {
    return GuardianLog.find({ userId }).sort({ timestamp: -1 }).limit(limit).lean();
  }
}

export const guardianService = new GuardianService();
