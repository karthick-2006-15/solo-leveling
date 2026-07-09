import mongoose, { Document, Schema } from 'mongoose';

export interface IMemoryCrystal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  milestoneType: string;
  levelSnapshot: number;
  rankSnapshot: string;
  statsSnapshot: Record<string, any>;
  badgeIcon?: string;
  ariaMessage?: string;
  date: Date;
}

const MemoryCrystalSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  milestoneType: { type: String, required: true },
  levelSnapshot: { type: Number, required: true },
  rankSnapshot: { type: String, required: true },
  statsSnapshot: { type: Schema.Types.Mixed, required: true },
  badgeIcon: { type: String },
  ariaMessage: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

MemoryCrystalSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IMemoryCrystal>('MemoryCrystal', MemoryCrystalSchema);
