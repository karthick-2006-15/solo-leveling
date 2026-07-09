import mongoose from 'mongoose';
import ProgressionProfile from '../models/ProgressionProfile';
import QuestInstance from '../models/QuestInstance';
import InnerMonarch from '../models/InnerMonarch';
import Dungeon from '../models/Dungeon';
import RecoveryLog from '../models/RecoveryLog';

export interface IAriaContext {
  level: number;
  rank: string;
  recoveryScore: number;
  coins: number;
  todayMissionsTotal: number;
  todayMissionsCompleted: number;
  monarchStage: string;
  activeDungeon: string | null;
  recentSleep: number;
}

export const gatherUserContext = async (userId: string | mongoose.Types.ObjectId): Promise<IAriaContext> => {
  const [profile, monarch, dungeons, recovery] = await Promise.all([
    ProgressionProfile.findOne({ userId }),
    InnerMonarch.findOne({ userId }),
    Dungeon.find({ userId, status: 'Active' }),
    RecoveryLog.findOne({ userId, date: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
  ]);

  // Count today's missions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const missions = await QuestInstance.find({ userId, createdAt: { $gte: today } });
  const completed = missions.filter((m: any) => m.status === 'Completed').length;

  return {
    level: profile?.level || 1,
    rank: profile?.rank || 'E',
    recoveryScore: recovery?.recoveryScore || 100,
    coins: profile?.coins || 0,
    todayMissionsTotal: missions.length,
    todayMissionsCompleted: completed,
    monarchStage: monarch?.evolutionStage || 'Dormant',
    activeDungeon: dungeons.length > 0 ? `${dungeons[0].name} (${dungeons[0].difficulty})` : null,
    recentSleep: recovery?.components?.sleepScore || 0
  };
};

export const formatContextForPrompt = (context: IAriaContext): string => {
  return `
--- CURRENT HUNTER STATUS ---
Level: ${context.level} | Rank: ${context.rank}
Recovery Score: ${context.recoveryScore}/100
Coins: ${context.coins}
Monarch Stage: ${context.monarchStage}
Today's Missions: ${context.todayMissionsCompleted}/${context.todayMissionsTotal} completed
Active Dungeon: ${context.activeDungeon || 'None'}
Sleep Logged Today: ${context.recentSleep} hours
-----------------------------
`;
};
