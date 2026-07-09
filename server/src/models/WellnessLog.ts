import mongoose, { Document, Schema } from 'mongoose';

export interface IWellnessLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  mood: number; // 1-10
  stress: number; // 1-10
  focus: number; // 1-10
  meditationMinutes: number;
  breathingMinutes: number;
  notes?: string;
  loggedAt: Date;
}

const WellnessLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  mood: { type: Number, required: true, min: 1, max: 10 },
  stress: { type: Number, required: true, min: 1, max: 10 },
  focus: { type: Number, required: true, min: 1, max: 10 },
  meditationMinutes: { type: Number, default: 0 },
  breathingMinutes: { type: Number, default: 0 },
  notes: { type: String },
  loggedAt: { type: Date, default: Date.now }
}, { timestamps: true });

WellnessLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IWellnessLog>('WellnessLog', WellnessLogSchema);
