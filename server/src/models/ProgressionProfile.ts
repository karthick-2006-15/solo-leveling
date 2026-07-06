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
  unlockedAchievements: Array<{
    achievementId: string;
    unlockedAt: Date;
  }>;
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
  unlockedAchievements: [{
    achievementId: { type: String },
    unlockedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IProgressionProfile>('ProgressionProfile', ProgressionProfileSchema);
