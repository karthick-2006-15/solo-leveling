import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  routineId?: mongoose.Types.ObjectId;
  date: Date;
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight: number;
    }>;
    restTimeSeconds: number;
    notes?: string;
  }>;
  totalVolume: number;
  durationMinutes?: number;
  completedAt: Date;
}

const WorkoutSessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  routineId: { type: Schema.Types.ObjectId, ref: 'WorkoutRoutine' },
  date: { type: Date, default: Date.now },
  exercises: [{
    name: { type: String, required: true },
    sets: [{
      reps: { type: Number, required: true },
      weight: { type: Number, required: true }
    }],
    restTimeSeconds: { type: Number, default: 0 },
    notes: { type: String }
  }],
  totalVolume: { type: Number, required: true, default: 0 },
  durationMinutes: { type: Number },
  completedAt: { type: Date, default: Date.now }
});

WorkoutSessionSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);
