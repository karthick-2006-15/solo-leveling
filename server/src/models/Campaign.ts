import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string; // e.g., '30-Day Challenge', '75 Hard'
  startDate: Date;
  endDate: Date;
  dungeons: mongoose.Types.ObjectId[];
  progress: number;
  status: 'Active' | 'Completed' | 'Failed';
}

const CampaignSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  dungeons: [{ type: Schema.Types.ObjectId, ref: 'Dungeon' }],
  progress: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Failed'],
    default: 'Active' 
  }
}, { timestamps: true });

CampaignSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
