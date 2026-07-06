import mongoose, { Document, Schema } from 'mongoose';

export interface IConversationSummary extends Document {
  userId: mongoose.Types.ObjectId;
  summary: string;
  updatedAt: Date;
}

const ConversationSummarySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  summary: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IConversationSummary>('ConversationSummary', ConversationSummarySchema);
