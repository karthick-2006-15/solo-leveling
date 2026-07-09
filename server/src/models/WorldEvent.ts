import mongoose, { Document, Schema } from 'mongoose';

export interface IWorldEvent extends Document {
  name: string;
  description: string;
  modifiers: {
    xpMultiplier?: number;
    coinMultiplier?: number;
    luckBonus?: number;
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  bannerImage?: string;
  themeColor?: string;
}

const WorldEventSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  modifiers: {
    xpMultiplier: { type: Number, default: 1 },
    coinMultiplier: { type: Number, default: 1 },
    luckBonus: { type: Number, default: 0 },
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  bannerImage: { type: String },
  themeColor: { type: String }
}, { timestamps: true });

WorldEventSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export default mongoose.model<IWorldEvent>('WorldEvent', WorldEventSchema);
