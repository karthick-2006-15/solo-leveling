import mongoose, { Document, Schema } from 'mongoose';

export interface IXPLog extends Document {
  userId: mongoose.Types.ObjectId;
  source: string;
  amount: number;
  createdAt: Date;
}

const XPLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

// Index for fast queries on a user's logs, particularly for daily summaries
XPLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IXPLog>('XPLog', XPLogSchema);
