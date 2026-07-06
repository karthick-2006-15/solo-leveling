import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  userId: mongoose.Types.ObjectId;
  key: string;
  name: string;
  icon: string;
  currentXP: number;
  level: number;
  notes?: string;
  learningResources: {
    _id: mongoose.Types.ObjectId;
    title: string;
    url: string;
  }[];
  milestones: {
    _id: mongoose.Types.ObjectId;
    title: string;
    completed: boolean;
    completedAt?: Date;
    xpReward: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  currentXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  notes: { type: String },
  learningResources: [{
    title: { type: String, required: true },
    url: { type: String, required: true }
  }],
  milestones: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    xpReward: { type: Number, default: 50 }
  }]
}, { timestamps: true });

// Prevent duplicate keys per user
SkillSchema.index({ userId: 1, key: 1 }, { unique: true });

export default mongoose.model<ISkill>('Skill', SkillSchema);
