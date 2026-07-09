import mongoose, { Document, Schema } from 'mongoose';

export interface IRecoveryLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  recoveryScore: number; // 0-100
  energyScore: number; // 0-100
  readinessScore: number; // 0-100
  components: {
    sleepScore: number;
    nutritionScore: number;
    workoutIntensity: number;
    stressPenalty: number;
  };
  loggedAt: Date;
}

const RecoveryLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  recoveryScore: { type: Number, required: true, min: 0, max: 100 },
  energyScore: { type: Number, required: true, min: 0, max: 100 },
  readinessScore: { type: Number, required: true, min: 0, max: 100 },
  components: {
    sleepScore: { type: Number, default: 0 },
    nutritionScore: { type: Number, default: 0 },
    workoutIntensity: { type: Number, default: 0 },
    stressPenalty: { type: Number, default: 0 }
  },
  loggedAt: { type: Date, default: Date.now }
}, { timestamps: true });

RecoveryLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IRecoveryLog>('RecoveryLog', RecoveryLogSchema);
