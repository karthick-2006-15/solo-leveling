import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicProfile extends Document {
  userId: mongoose.Types.ObjectId;
  currentSemester: number;
  cgpa: number;
  subjects: Array<{
    name: string;
    attendancePercentage: number;
    internalMarks: number;
    targetMarks: number;
  }>;
  assignmentsPending: number;
  examsUpcoming: number;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicProfileSchema = new Schema<IAcademicProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentSemester: { type: Number, default: 1 },
  cgpa: { type: Number, default: 0.0 },
  subjects: [{
    name: { type: String, required: true },
    attendancePercentage: { type: Number, default: 100 },
    internalMarks: { type: Number, default: 0 },
    targetMarks: { type: Number, default: 100 }
  }],
  assignmentsPending: { type: Number, default: 0 },
  examsUpcoming: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IAcademicProfile>('AcademicProfile', AcademicProfileSchema);
