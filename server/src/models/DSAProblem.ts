import mongoose, { Document, Schema } from 'mongoose';

export interface IDSAProblem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  topic: 'arrays' | 'strings' | 'linked_lists' | 'trees' | 'graphs' | 'stacks' | 'queues' | 'heap' | 'dynamic_programming' | 'greedy' | 'backtracking' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  platform: string;
  timeTakenMinutes?: number;
  notes?: string;
  revisionStatus: 'not_revised' | 'needs_revision' | 'mastered';
  solvedAt: Date;
}

const DSAProblemSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  topic: { 
    type: String, 
    enum: ['arrays', 'strings', 'linked_lists', 'trees', 'graphs', 'stacks', 'queues', 'heap', 'dynamic_programming', 'greedy', 'backtracking', 'other'],
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    required: true 
  },
  platform: { type: String, required: true },
  timeTakenMinutes: { type: Number },
  notes: { type: String },
  revisionStatus: { 
    type: String, 
    enum: ['not_revised', 'needs_revision', 'mastered'],
    default: 'not_revised' 
  },
  solvedAt: { type: Date, default: Date.now }
});

DSAProblemSchema.index({ userId: 1, solvedAt: -1 });
DSAProblemSchema.index({ userId: 1, topic: 1 });
DSAProblemSchema.index({ userId: 1, difficulty: 1 });

export default mongoose.model<IDSAProblem>('DSAProblem', DSAProblemSchema);
