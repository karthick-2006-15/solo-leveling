import mongoose, { Document, Schema } from 'mongoose';

export interface IWaterLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  amountMl: number;
  loggedAt: Date;
}

const WaterLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  amountMl: { type: Number, required: true },
  loggedAt: { type: Date, default: Date.now }
});

WaterLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IWaterLog>('WaterLog', WaterLogSchema);
