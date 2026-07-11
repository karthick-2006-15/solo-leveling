import mongoose, { Document, Schema } from 'mongoose';

export interface IProgressionProfile extends Document {
  userId: mongoose.Types.ObjectId;
  level: number;
  currentXP: number;
  totalXP: number;
  coins: number;
  rank: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  lastClaimDate: Date | null;
  nextClaimAt: Date | null;
  totalClaims: number;
  unlockedAchievements: Array<{
    achievementId: string;
    unlockedAt: Date;
  }>;
  prestigeLevel: number;
  prestigePoints: number;
  hunterScore: number;
  lifetimeCoinsEarned: number;
  lifetimeCoinsSpent: number;
  weeklyCoins: number;
  monthlyCoins: number;
  skillPoints: number;
  equippedRelics: mongoose.Types.ObjectId[];
  missedDays: number;
  luckBase: number;
  pityCounter: number;
}

const ProgressionProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  level: { type: Number, default: 1 },
  currentXP: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  rank: { type: String, default: 'Beginner' },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  lastClaimDate: { type: Date, default: null },
  nextClaimAt: { type: Date, default: null },
  totalClaims: { type: Number, default: 0 },
  unlockedAchievements: [{
    achievementId: { type: String },
    unlockedAt: { type: Date, default: Date.now }
  }],
  prestigeLevel: { type: Number, default: 0 },
  prestigePoints: { type: Number, default: 0 },
  hunterScore: { type: Number, default: 0 },
  lifetimeCoinsEarned: { type: Number, default: 0 },
  lifetimeCoinsSpent: { type: Number, default: 0 },
  weeklyCoins: { type: Number, default: 0 },
  monthlyCoins: { type: Number, default: 0 },
  skillPoints: { type: Number, default: 0 },
  equippedRelics: [{ type: Schema.Types.ObjectId, ref: 'InventoryItem' }],
  missedDays: { type: Number, default: 0 },
  luckBase: { type: Number, default: 10 },
  pityCounter: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IProgressionProfile>('ProgressionProfile', ProgressionProfileSchema);
