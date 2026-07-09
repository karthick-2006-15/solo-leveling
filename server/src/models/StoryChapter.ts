import mongoose, { Document, Schema } from 'mongoose';

export interface IStoryChapter extends Document {
  chapterNumber: number;
  title: string;
  content: string; // Markdown text
  unlockConditions: {
    requiredLevel?: number;
    requiredRank?: string;
    requiredDungeonsCleared?: number;
  };
  isUnlocked: boolean; // Note: This might be better tracked per user in a separate collection, but for now we can track unlocked chapters per user by creating a document per user, or tracking globally. We will track it globally but unlock per user in a UserStoryProgress model if needed. Wait, let's create a UserStoryChapter model.
}

// Actually, let's make it a UserStoryChapter to tie it to the userId.
export interface IUserStoryChapter extends Document {
  userId: mongoose.Types.ObjectId;
  chapterNumber: number;
  title: string;
  content: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

const UserStoryChapterSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date }
}, { timestamps: true });

UserStoryChapterSchema.index({ userId: 1, chapterNumber: 1 }, { unique: true });

export default mongoose.model<IUserStoryChapter>('UserStoryChapter', UserStoryChapterSchema);
