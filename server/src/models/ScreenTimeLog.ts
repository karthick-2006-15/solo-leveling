import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenTimeLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalTimeMinutes: number;
  productiveTimeMinutes: number;
  unproductiveTimeMinutes: number;
  
  socialMediaMinutes: number;
  gamingMinutes: number;
  learningMinutes: number;
  readingMinutes: number;
  codingMinutes: number;
  entertainmentMinutes: number;
  communicationMinutes: number;
  neutralMinutes: number;

  apps: Array<{
    name: string;
    minutes: number;
    category: string;
  }>;
  
  focusScore: number;
  productivityScore: number;
  corruptionIncrease: number;
  dopamineImpact: number;
  timeLost: number;
  potentialTimeRecovered: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScreenTimeLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalTimeMinutes: { type: Number, required: true, default: 0 },
  productiveTimeMinutes: { type: Number, required: true, default: 0 },
  unproductiveTimeMinutes: { type: Number, required: true, default: 0 },
  
  socialMediaMinutes: { type: Number, default: 0 },
  gamingMinutes: { type: Number, default: 0 },
  learningMinutes: { type: Number, default: 0 },
  readingMinutes: { type: Number, default: 0 },
  codingMinutes: { type: Number, default: 0 },
  entertainmentMinutes: { type: Number, default: 0 },
  communicationMinutes: { type: Number, default: 0 },
  neutralMinutes: { type: Number, default: 0 },

  apps: [{
    name: { type: String, required: true },
    minutes: { type: Number, required: true },
    category: { type: String, required: true }
  }],
  
  focusScore: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 },
  corruptionIncrease: { type: Number, default: 0 },
  dopamineImpact: { type: Number, default: 0 },
  timeLost: { type: Number, default: 0 },
  potentialTimeRecovered: { type: Number, default: 0 },
}, { timestamps: true });

ScreenTimeLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IScreenTimeLog>('ScreenTimeLog', ScreenTimeLogSchema);
