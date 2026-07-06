import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonalRecord extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseName: string;
  maxWeight: number;
  repsAtMaxWeight: number;
  achievedAt: Date;
  sessionId: mongoose.Types.ObjectId;
}

const PersonalRecordSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseName: { type: String, required: true },
  maxWeight: { type: Number, required: true },
  repsAtMaxWeight: { type: Number, required: true },
  achievedAt: { type: Date, default: Date.now },
  sessionId: { type: Schema.Types.ObjectId, ref: 'WorkoutSession', required: true }
});

// Index to quickly look up PRs by user and exercise name
PersonalRecordSchema.index({ userId: 1, exerciseName: 1 }, { unique: true });

export default mongoose.model<IPersonalRecord>('PersonalRecord', PersonalRecordSchema);
