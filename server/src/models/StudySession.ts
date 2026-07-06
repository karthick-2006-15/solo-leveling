import mongoose, { Document, Schema } from 'mongoose';

export interface IStudySession extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  durationMinutes?: number;
  notes?: string;
  loggedAt: Date;
}

const StudySessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  durationMinutes: { type: Number },
  notes: { type: String },
  loggedAt: { type: Date, default: Date.now }
});

StudySessionSchema.index({ userId: 1, skillId: 1 });
StudySessionSchema.index({ userId: 1, loggedAt: -1 });

export default mongoose.model<IStudySession>('StudySession', StudySessionSchema);
