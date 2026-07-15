import mongoose, { Document, Schema } from 'mongoose';

export interface IDistractionBoss extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  level: number;
  maxHp: number;
  currentHp: number;
  defeatedCount: number;
  isDefeated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DistractionBossSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, default: 'The Doomscroller' },
  level: { type: Number, required: true, default: 1 },
  maxHp: { type: Number, required: true, default: 500 },
  currentHp: { type: Number, required: true, default: 250 },
  defeatedCount: { type: Number, required: true, default: 0 },
  isDefeated: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export default mongoose.model<IDistractionBoss>('DistractionBoss', DistractionBossSchema);
