import mongoose, { Document, Schema } from 'mongoose';

export interface ICoinLog extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  source: string;
  createdAt: Date;
}

const CoinLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
}, { timestamps: true });

CoinLogSchema.index({ userId: 1, source: 1, createdAt: -1 });

export default mongoose.model<ICoinLog>('CoinLog', CoinLogSchema);
