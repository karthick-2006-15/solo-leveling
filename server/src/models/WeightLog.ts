import mongoose, { Document, Schema } from 'mongoose';

export interface IWeightLog extends Document {
  userId: mongoose.Types.ObjectId;
  weight: number;
  bodyFatPercent?: number;
  leanMass?: number;
  fatMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep?: number;
    thigh?: number;
  };
  loggedAt: Date;
}

const WeightLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weight: { type: Number, required: true },
  bodyFatPercent: { type: Number },
  leanMass: { type: Number },
  fatMass: { type: Number },
  measurements: {
    chest: { type: Number },
    waist: { type: Number },
    hips: { type: Number },
    bicep: { type: Number },
    thigh: { type: Number }
  },
  loggedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export default mongoose.model<IWeightLog>('WeightLog', WeightLogSchema);
