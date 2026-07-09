import mongoose, { Document, Schema } from 'mongoose';

export interface IAriaMemory extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'Preference' | 'Goal' | 'Milestone' | 'Weakness' | 'General';
  content: string;
  importance: number; // 1-10
  createdAt: Date;
  updatedAt: Date;
}

const AriaMemorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, enum: ['Preference', 'Goal', 'Milestone', 'Weakness', 'General'], required: true },
  content: { type: String, required: true },
  importance: { type: Number, required: true, min: 1, max: 10, default: 5 },
}, { timestamps: true });

export const AriaMemory = mongoose.model<IAriaMemory>('AriaMemory', AriaMemorySchema);
