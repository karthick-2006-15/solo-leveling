import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutRoutine extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  splitType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body' | 'custom';
  exercises: Array<{
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    restTimeSeconds: number;
    notes?: string;
  }>;
  createdAt: Date;
}

const WorkoutRoutineSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  splitType: { 
    type: String, 
    enum: ['push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'custom'],
    default: 'custom'
  },
  exercises: [{
    name: { type: String, required: true },
    targetSets: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    targetWeight: { type: Number, default: 0 },
    restTimeSeconds: { type: Number, default: 90 },
    notes: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model<IWorkoutRoutine>('WorkoutRoutine', WorkoutRoutineSchema);
