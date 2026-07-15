import mongoose, { Document, Schema } from 'mongoose';

export type GuardianActionType = 'relapse' | 'urge_resisted' | 'dungeon_completed' | 'safe_mode_completed' | 'morning_oath';

export interface IGuardianLog extends Document {
  userId: mongoose.Types.ObjectId;
  actionType: GuardianActionType;
  durationMinutes?: number;
  emotion?: string;
  triggerContext?: string;
  timestamp: Date;
}

const GuardianLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { 
    type: String, 
    enum: ['relapse', 'urge_resisted', 'dungeon_completed', 'safe_mode_completed', 'morning_oath'],
    required: true 
  },
  durationMinutes: { type: Number },
  emotion: { type: String },
  triggerContext: { type: String },
  timestamp: { type: Date, default: Date.now }
});

GuardianLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IGuardianLog>('GuardianLog', GuardianLogSchema);
