import mongoose, { Document, Schema } from 'mongoose';

export interface IAppClassification extends Document {
  userId: mongoose.Types.ObjectId;
  appName: string;
  category: 'productive' | 'learning' | 'social_media' | 'gaming' | 'entertainment' | 'communication' | 'neutral';
  createdAt: Date;
  updatedAt: Date;
}

const AppClassificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['productive', 'learning', 'social_media', 'gaming', 'entertainment', 'communication', 'neutral'],
    default: 'neutral'
  }
}, { timestamps: true });

AppClassificationSchema.index({ userId: 1, appName: 1 }, { unique: true });

export default mongoose.model<IAppClassification>('AppClassification', AppClassificationSchema);
