import mongoose, { Document, Schema } from 'mongoose';

export interface ILustBoss extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  level: number;
  maxHp: number;
  currentHp: number;
  defeatedCount: number;
}

const LustBossSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: 'The Asmodeus Manifest' },
  level: { type: Number, default: 1 },
  maxHp: { type: Number, default: 500 },
  currentHp: { type: Number, default: 500 },
  defeatedCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ILustBoss>('LustBoss', LustBossSchema);
