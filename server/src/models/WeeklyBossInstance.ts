import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyBossInstance extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date; // Monday of the week
  templateId: string;
  requirements: Array<{
    metric: string;
    target: number;
    currentProgress: number;
    label: string;
    habitKey?: string;
  }>;
  defeated: boolean;
  defeatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyBossInstanceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekStartDate: { type: Date, required: true },
  templateId: { type: String, required: true },
  requirements: [{
    metric: { type: String, required: true },
    target: { type: Number, required: true },
    currentProgress: { type: Number, default: 0 },
    label: { type: String, required: true },
    habitKey: { type: String }
  }],
  defeated: { type: Boolean, default: false },
  defeatedAt: { type: Date },
}, { timestamps: true });

WeeklyBossInstanceSchema.index({ userId: 1, weekStartDate: 1 });

export default mongoose.model<IWeeklyBossInstance>('WeeklyBossInstance', WeeklyBossInstanceSchema);
