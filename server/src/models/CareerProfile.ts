import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  jobRole: string; // e.g., 'Software Engineer'
  resumeStatus: 'NEEDS_UPDATE' | 'GOOD' | 'EXCELLENT';
  githubUsername?: string;
  leetCodeUsername?: string;
  dsaProblemsSolved: number;
  projectsCompleted: number;
  internshipStatus: 'SEARCHING' | 'APPLIED' | 'INTERVIEWING' | 'HIRED' | 'N/A';
  placementStatus: 'SEARCHING' | 'APPLIED' | 'INTERVIEWING' | 'HIRED' | 'N/A';
  careerMissionsCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const CareerProfileSchema = new Schema<ICareerProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  jobRole: { type: String, default: 'Undecided' },
  resumeStatus: { type: String, enum: ['NEEDS_UPDATE', 'GOOD', 'EXCELLENT'], default: 'NEEDS_UPDATE' },
  githubUsername: { type: String },
  leetCodeUsername: { type: String },
  dsaProblemsSolved: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  internshipStatus: { 
    type: String, 
    enum: ['SEARCHING', 'APPLIED', 'INTERVIEWING', 'HIRED', 'N/A'], 
    default: 'N/A' 
  },
  placementStatus: { 
    type: String, 
    enum: ['SEARCHING', 'APPLIED', 'INTERVIEWING', 'HIRED', 'N/A'], 
    default: 'N/A' 
  },
  careerMissionsCompleted: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ICareerProfile>('CareerProfile', CareerProfileSchema);
