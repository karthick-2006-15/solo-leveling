import mongoose, { Document, Schema } from 'mongoose';

export interface IBoss extends Document {
  userId: mongoose.Types.ObjectId;
  dungeonId: mongoose.Types.ObjectId;
  name: string;
  totalHp: number;
  currentHp: number;
  damagePerMission: number;
  phase: number;
  isEnraged: boolean;
  isDefeated: boolean;
  rewards: {
    xp?: number;
    coins?: number;
    items?: string[];
  };
  defeatedAt?: Date;
}

const BossSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dungeonId: { type: Schema.Types.ObjectId, ref: 'Dungeon', required: true },
  name: { type: String, required: true },
  totalHp: { type: Number, required: true, default: 100 },
  currentHp: { type: Number, required: true, default: 100 },
  damagePerMission: { type: Number, required: true, default: 20 },
  phase: { type: Number, default: 1 },
  isEnraged: { type: Boolean, default: false },
  isDefeated: { type: Boolean, default: false },
  rewards: {
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    items: [{ type: String }]
  },
  defeatedAt: { type: Date }
}, { timestamps: true });

BossSchema.index({ dungeonId: 1, userId: 1 });

export default mongoose.model<IBoss>('Boss', BossSchema);
