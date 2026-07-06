import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  xpValue: number;
  isDefault: boolean;
  active: boolean;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date | null;
  createdAt: Date;
}

const HabitSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  xpValue: { type: Number, default: 20 },
  isDefault: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model<IHabit>('Habit', HabitSchema);
