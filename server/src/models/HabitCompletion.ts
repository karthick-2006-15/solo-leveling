import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitCompletion extends Document {
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  date: string; // Format: YYYY-MM-DD
  completedAt: Date;
}

const HabitCompletionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String, required: true },
  completedAt: { type: Date, default: Date.now }
});

// Compound index to prevent double completions on the same calendar day
HabitCompletionSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// Index for checking completions for a specific day
HabitCompletionSchema.index({ userId: 1, habitId: 1, completedAt: -1 });
// General timeline index
HabitCompletionSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.model<IHabitCompletion>('HabitCompletion', HabitCompletionSchema);
