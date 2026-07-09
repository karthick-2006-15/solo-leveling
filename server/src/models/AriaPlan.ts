import mongoose, { Document, Schema } from 'mongoose';

export interface IAriaPlan extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'CAREER' | 'TRANSFORMATION';
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  startDate: Date;
  endDate?: Date;
  milestones: Array<{
    title: string;
    description: string;
    completed: boolean;
    dueDate?: Date;
  }>;
  generatedBy: 'ARIA' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

const AriaPlanSchema = new Schema<IAriaPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'CAREER', 'TRANSFORMATION'], 
    required: true 
  },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ABANDONED'], default: 'ACTIVE' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  milestones: [{
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date }
  }],
  generatedBy: { type: String, enum: ['ARIA', 'USER'], default: 'ARIA' },
}, { timestamps: true });

AriaPlanSchema.index({ userId: 1, type: 1, status: 1 });

export default mongoose.model<IAriaPlan>('AriaPlan', AriaPlanSchema);
