import mongoose, { Document, Schema } from 'mongoose';

export interface IConversationMessage extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  isProactive?: boolean;
  embedding?: number[];
  createdAt: Date;
}

const ConversationMessageSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  isProactive: { type: Boolean, default: false },
  embedding: { type: [Number], required: false },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for fetching recent history
ConversationMessageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IConversationMessage>('ConversationMessage', ConversationMessageSchema);
