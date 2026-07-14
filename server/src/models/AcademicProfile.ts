import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicProfile extends Document {
  userId: mongoose.Types.ObjectId;
  currentSemester: number;
  cgpa: number;
  semesters: Array<{
    id?: string;
    semesterNumber: number;
    sgpa: number;
    isActive: boolean;
  }>;
  subjects: Array<{
    id?: string;
    semesterNumber: number;
    name: string;
    credits: number;
    faculty: string;
    attendancePercentage: number;
    internalMarks: number;
    labMarks: number;
    assignmentMarks: number;
    targetGrade: string;
    difficulty: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high';
    color: string;
    totalClasses: number;
    attendedClasses: number;
  }>;
  assignments: Array<{
    id?: string;
    title: string;
    subjectName: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    progress: number;
    xpReward: number;
    notes: string;
    isCompleted: boolean;
  }>;
  exams: Array<{
    id?: string;
    title: string;
    subjectName: string;
    examDate: string;
    preparationPercentage: number;
    expectedGrade: string;
    confidenceScore: number;
    revisionsCompleted: number;
    isCompleted: boolean;
  }>;
  projects: Array<{
    id?: string;
    name: string;
    progress: number;
    milestones: Array<{ title: string; completed: boolean }>;
    bugCount: number;
    githubLink: string;
    deploymentStatus: 'none' | 'staging' | 'production';
  }>;
  codingTracker: {
    dsaSolved: number;
    leetcodeSolved: number;
    codeforcesRating: number;
    githubCommits: number;
    codingHours: number;
    languages: string[];
  };
  studyPlans: Array<{
    id?: string;
    title: string;
    tasks: Array<{ title: string; duration: number; isCompleted: boolean }>;
    createdAt: Date;
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
  semesters: [{
    semesterNumber: { type: Number, required: true },
    sgpa: { type: Number, default: 0.0 },
    isActive: { type: Boolean, default: false }
  }],
  subjects: [{
    semesterNumber: { type: Number, default: 1 },
    name: { type: String, required: true },
    credits: { type: Number, default: 3 },
    faculty: { type: String, default: '' },
    attendancePercentage: { type: Number, default: 100 },
    internalMarks: { type: Number, default: 0 },
    labMarks: { type: Number, default: 0 },
    assignmentMarks: { type: Number, default: 0 },
    targetGrade: { type: String, default: 'S' },
    difficulty: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    color: { type: String, default: '#8B5CF6' },
    totalClasses: { type: Number, default: 0 },
    attendedClasses: { type: Number, default: 0 }
  }],
  assignments: [{
    title: { type: String, required: true },
    subjectName: { type: String, required: true },
    dueDate: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    progress: { type: Number, default: 0 },
    xpReward: { type: Number, default: 100 },
    notes: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false }
  }],
  exams: [{
    title: { type: String, required: true },
    subjectName: { type: String, required: true },
    examDate: { type: String, required: true },
    preparationPercentage: { type: Number, default: 0 },
    expectedGrade: { type: String, default: 'S' },
    confidenceScore: { type: Number, default: 5 },
    revisionsCompleted: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
  }],
  projects: [{
    name: { type: String, required: true },
    progress: { type: Number, default: 0 },
    milestones: [{
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }],
    bugCount: { type: Number, default: 0 },
    githubLink: { type: String, default: '' },
    deploymentStatus: { type: String, enum: ['none', 'staging', 'production'], default: 'none' }
  }],
  codingTracker: {
    dsaSolved: { type: Number, default: 0 },
    leetcodeSolved: { type: Number, default: 0 },
    codeforcesRating: { type: Number, default: 0 },
    githubCommits: { type: Number, default: 0 },
    codingHours: { type: Number, default: 0 },
    languages: [{ type: String }]
  },
  studyPlans: [{
    title: { type: String, required: true },
    tasks: [{
      title: { type: String, required: true },
      duration: { type: Number, default: 30 },
      isCompleted: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  assignmentsPending: { type: Number, default: 0 },
  examsUpcoming: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IAcademicProfile>('AcademicProfile', AcademicProfileSchema);
