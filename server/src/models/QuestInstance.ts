import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestInstance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // e.g. start of day
  templateId: string;
  type?: string;
  title: string;
  description: string;
  targetValue?: number;
  dependencies?: mongoose.Types.ObjectId[];
  unlocks?: mongoose.Types.ObjectId[];
  currentProgress: number;
  completed: boolean;
  completedAt?: Date;
  status?: string;
  isShadow?: boolean;
  xpReward: number;
  coinReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestInstanceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  templateId: { type: String, required: true },
  type: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetValue: { type: Number },
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'QuestInstance' }],
  unlocks: [{ type: Schema.Types.ObjectId, ref: 'QuestInstance' }],
  currentProgress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'failed', 'abandoned'], default: 'active' },
  isShadow: { type: Boolean, default: false },
  xpReward: { type: Number, required: true },
  coinReward: { type: Number, required: true },
}, { timestamps: true });

QuestInstanceSchema.index({ userId: 1, date: 1 });

export default mongoose.model<IQuestInstance>('QuestInstance', QuestInstanceSchema);
