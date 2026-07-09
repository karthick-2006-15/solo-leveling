import Dungeon from '../models/Dungeon';
import ProgressionProfile from '../models/ProgressionProfile';
import QuestInstance from '../models/QuestInstance';

class DungeonService {
  async getActiveDungeons(userId: string) {
    return await Dungeon.find({ userId, status: 'Active', isHidden: false }).populate('missions');
  }

  async getHiddenDungeons(userId: string) {
    return await Dungeon.find({ userId, status: 'Active', isHidden: true }).populate('missions');
  }

  async generateDailyDungeon(userId: string) {
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) throw new Error("Profile not found.");

    // Dynamic difficulty calculation based on Level and Recovery
    let difficulty: 'Easy' | 'Normal' | 'Hard' | 'Elite' | 'Nightmare' | 'Monarch' = 'Normal';
    
    if (profile.level > 10) difficulty = 'Hard';
    if (profile.level > 25) difficulty = 'Elite';
    if (profile.level > 50) difficulty = 'Nightmare';
    if (profile.level > 80) difficulty = 'Monarch';

    // Fetch some active missions to link to the dungeon
    // For simplicity, we'll link all pending missions of today
    const _now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const pendingMissions = await QuestInstance.find({
      userId,
      status: 'pending',
      nextOccurrence: { $lte: endOfDay }
    }).limit(3);

    const missionIds = pendingMissions.map((m: any) => m._id as any);

    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    const dungeon = await Dungeon.create({
      userId,
      name: `Daily System Gate [${difficulty}]`,
      type: 'Daily',
      difficulty,
      status: 'Active',
      requiredLevel: Math.floor(profile.level / 5) * 5,
      requiredRank: profile.rank,
      isHidden: false,
      missions: missionIds,
      rewards: {
        xp: 100 * (profile.level || 1),
        coins: 50 * (profile.level || 1)
      },
      expiresAt
    });

    return dungeon;
  }

  async clearDungeon(userId: string, dungeonId: string) {
    const dungeon = await Dungeon.findOne({ _id: dungeonId, userId, status: 'Active' });
    if (!dungeon) return null;

    // Check if all missions are completed
    const missions = await QuestInstance.find({ _id: { $in: dungeon.missions } });
    const allCompleted = missions.every((m: any) => m.status === 'completed');

    if (allCompleted) {
      dungeon.status = 'Cleared';
      dungeon.completedAt = new Date();
      await dungeon.save();

      await ProgressionProfile.updateOne(
        { userId },
        { $inc: { dungeonsCleared: 1 } }
      );

      // We don't automatically dispatch rewards here, the bossService will handle boss victory.
      // But if it's a dungeon without a boss, we could dispatch rewards.
      return dungeon;
    }
    return null;
  }
}

export const dungeonService = new DungeonService();
