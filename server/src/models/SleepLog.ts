import mongoose, { Document, Schema } from 'mongoose';

export interface ISleepLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  durationMinutes: number;
  quality: number; // 0-100
  bedTime?: Date;
  wakeTime?: Date;
  sleepDebt?: number; // minutes
  loggedAt: Date;
}

const SleepLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  quality: { type: Number, required: true, min: 0, max: 100 },
  bedTime: { type: Date },
  wakeTime: { type: Date },
  sleepDebt: { type: Number, default: 0 },
  loggedAt: { type: Date, default: Date.now }
}, { timestamps: true });

SleepLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model<ISleepLog>('SleepLog', SleepLogSchema);
