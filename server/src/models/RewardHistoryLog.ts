import mongoose, { Document, Schema } from 'mongoose';

export interface IRewardHistoryLog extends Document {
  userId: mongoose.Types.ObjectId;
  source: string;
  reason: string;
  coins: number;
  xp: number;
  skillPoints: number;
  metadata?: any;
  createdAt: Date;
}

const RewardHistoryLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  source: { type: String, required: true },
  reason: { type: String, required: true },
  coins: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  skillPoints: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

RewardHistoryLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IRewardHistoryLog>('RewardHistoryLog', RewardHistoryLogSchema);
