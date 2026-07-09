import mongoose, { Document, Schema } from 'mongoose';

export interface IDungeon extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string; // Daily, Study, Workout, etc.
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Elite' | 'Nightmare' | 'Monarch';
  status: 'Locked' | 'Active' | 'Cleared' | 'Failed';
  requiredLevel: number;
  requiredRank: string;
  requiredRecoveryScore: number;
  isHidden: boolean;
  missions: mongoose.Types.ObjectId[]; // Associated mission IDs
  rewards: {
    xp?: number;
    coins?: number;
    items?: string[];
  };
  expiresAt?: Date;
  completedAt?: Date;
}

const DungeonSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Normal', 'Hard', 'Elite', 'Nightmare', 'Monarch'],
    default: 'Normal' 
  },
  status: { 
    type: String, 
    enum: ['Locked', 'Active', 'Cleared', 'Failed'],
    default: 'Active' 
  },
  requiredLevel: { type: Number, default: 1 },
  requiredRank: { type: String, default: 'Beginner' },
  requiredRecoveryScore: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
  missions: [{ type: Schema.Types.ObjectId, ref: 'Mission' }],
  rewards: {
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    items: [{ type: String }]
  },
  expiresAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

DungeonSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IDungeon>('Dungeon', DungeonSchema);
