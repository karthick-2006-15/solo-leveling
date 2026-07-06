import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyReview extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  content: string;
  createdAt: Date;
}

const WeeklyReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWeeklyReview>('WeeklyReview', WeeklyReviewSchema);
