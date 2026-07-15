import mongoose, { Document, Schema } from 'mongoose';

export interface IRecoveryProfile extends Document {
  userId: mongoose.Types.ObjectId;
  willpower: number; // 0-100
  corruption: number; // 0-100
  currentStreak: number; // Days
  longestStreak: number;
  urgesResisted: number;
  recoveryMissionsCompleted: number;
  safeModeSessionsCompleted: number;
  lastRelapseDate: Date | null;
  morningOathAccepted: boolean;
  morningOathDate: Date | null;
  peakTriggerTimes: Array<{
    hour: number;
    count: number;
  }>;
}

const RecoveryProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  willpower: { type: Number, default: 50 },
  corruption: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  urgesResisted: { type: Number, default: 0 },
  recoveryMissionsCompleted: { type: Number, default: 0 },
  safeModeSessionsCompleted: { type: Number, default: 0 },
  lastRelapseDate: { type: Date, default: null },
  morningOathAccepted: { type: Boolean, default: false },
  morningOathDate: { type: Date, default: null },
  peakTriggerTimes: [{
    hour: { type: Number },
    count: { type: Number, default: 1 }
  }]
}, { timestamps: true });

export default mongoose.model<IRecoveryProfile>('RecoveryProfile', RecoveryProfileSchema);
