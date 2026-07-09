import mongoose, { Document, Schema } from 'mongoose';

export interface IAriaReport extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'Morning' | 'Evening' | 'Reflection';
  date: Date;
  content: string;
  metricsSnapshot: {
    level: number;
    rank: string;
    recoveryScore: number;
    coins: number;
  };
  createdAt: Date;
}

const AriaReportSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['Morning', 'Evening', 'Reflection'], required: true },
  date: { type: Date, required: true, default: Date.now },
  content: { type: String, required: true },
  metricsSnapshot: {
    level: { type: Number, default: 1 },
    rank: { type: String, default: 'E' },
    recoveryScore: { type: Number, default: 100 },
    coins: { type: Number, default: 0 },
  }
}, { timestamps: true });

// Prevent duplicate daily reports
AriaReportSchema.index({ userId: 1, type: 1, date: 1 });

export const AriaReport = mongoose.model<IAriaReport>('AriaReport', AriaReportSchema);
