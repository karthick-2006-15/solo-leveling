import mongoose, { Document, Schema } from 'mongoose';

export interface IMissionTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  icon: string;
  baseDifficulty: number; // 1-10
  category: 'study' | 'fitness' | 'nutrition' | 'recovery' | 'discipline' | 'career';
  prerequisites: mongoose.Types.ObjectId[]; // Other templates that must be unlocked
  unlocks: mongoose.Types.ObjectId[]; // Templates this one unlocks
  isHidden: boolean;
  isEmergency: boolean;
  isBonus: boolean;
  baseXP: number;
  baseCoins: number;
  scalingFactor: number; // e.g. 1.1 means 10% harder every consecutive day
  active: boolean; // if user is currently tracking this
}

const MissionTemplateSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  baseDifficulty: { type: Number, default: 1 },
  category: { 
    type: String, 
    enum: ['study', 'fitness', 'nutrition', 'recovery', 'discipline', 'career'],
    required: true
  },
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'MissionTemplate' }],
  unlocks: [{ type: Schema.Types.ObjectId, ref: 'MissionTemplate' }],
  isHidden: { type: Boolean, default: false },
  isEmergency: { type: Boolean, default: false },
  isBonus: { type: Boolean, default: false },
  baseXP: { type: Number, default: 20 },
  baseCoins: { type: Number, default: 5 },
  scalingFactor: { type: Number, default: 1.0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IMissionTemplate>('MissionTemplate', MissionTemplateSchema);
