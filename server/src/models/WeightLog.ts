import mongoose, { Document, Schema } from 'mongoose';

export interface IWeightLog extends Document {
  userId: mongoose.Types.ObjectId;
  weight: number;
  loggedAt: Date;
}

const WeightLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weight: { type: Number, required: true },
  loggedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export default mongoose.model<IWeightLog>('WeightLog', WeightLogSchema);
