import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: string;
  name: string;
  icon: string;
  description: string;
  earnedFrom: string; // e.g. 'weekly_boss:lazy_demon'
  earnedAt: Date;
}

const BadgeSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  badgeId: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  earnedFrom: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IBadge>('Badge', BadgeSchema);
