import mongoose, { Document, Schema } from 'mongoose';

export interface IAriaPrediction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'BURNOUT_RISK' | 'XP_GROWTH' | 'RANK_PROJECTION' | 'HABIT_FAILURE_RISK' | 'PERFORMANCE_TREND';
  targetDate?: Date;
  confidenceScore: number; // 0-100
  predictionData: any; // Flexible JSON for different prediction types
  status: 'ACTIVE' | 'RESOLVED' | 'INVALIDATED';
  createdAt: Date;
  updatedAt: Date;
}

const AriaPredictionSchema = new Schema<IAriaPrediction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['BURNOUT_RISK', 'XP_GROWTH', 'RANK_PROJECTION', 'HABIT_FAILURE_RISK', 'PERFORMANCE_TREND'], 
    required: true 
  },
  targetDate: { type: Date },
  confidenceScore: { type: Number, required: true, min: 0, max: 100 },
  predictionData: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'INVALIDATED'], default: 'ACTIVE' },
}, { timestamps: true });

AriaPredictionSchema.index({ userId: 1, type: 1, status: 1 });

export default mongoose.model<IAriaPrediction>('AriaPrediction', AriaPredictionSchema);
