import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestInstance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // e.g. start of day
  templateId: string;
  title: string;
  description: string;
  targetValue?: number;
  currentProgress: number;
  completed: boolean;
  completedAt?: Date;
  xpReward: number;
  coinReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestInstanceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  templateId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetValue: { type: Number },
  currentProgress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  xpReward: { type: Number, required: true },
  coinReward: { type: Number, required: true },
}, { timestamps: true });

QuestInstanceSchema.index({ userId: 1, date: 1 });

export default mongoose.model<IQuestInstance>('QuestInstance', QuestInstanceSchema);
