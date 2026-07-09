import mongoose, { Document, Schema } from 'mongoose';

export interface ILifeChapter extends Document {
  userId: mongoose.Types.ObjectId;
  
  activeChapter: number;
  chapterName: string;
  
  // Unlocked content for this chapter
  unlockedBosses: string[];
  unlockedThemes: string[];
  
  // Status of chapters 1-7
  chaptersStatus: Array<{
    chapter: number;
    name: string;
    isCompleted: boolean;
    completedAt?: Date;
  }>;

  updatedAt: Date;
  createdAt: Date;
}

const CHAPTER_NAMES = [
  'Awakening',
  'Building Discipline',
  'Breaking Addictions',
  'Mastering Consistency',
  'Elite Growth',
  'Career Ascension',
  'Shadow Monarch'
];

const LifeChapterSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  activeChapter: { type: Number, default: 1, min: 1, max: 7 },
  chapterName: { type: String, default: CHAPTER_NAMES[0] },
  
  unlockedBosses: [{ type: String }],
  unlockedThemes: [{ type: String }],
  
  chaptersStatus: [{
    chapter: Number,
    name: String,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
  }]

}, { timestamps: true });

// Pre-save to initialize chapters if empty
LifeChapterSchema.pre<ILifeChapter>('save', function(next) {
  if (this.isNew && this.chaptersStatus.length === 0) {
    this.chaptersStatus = CHAPTER_NAMES.map((name, idx) => ({
      chapter: idx + 1,
      name,
      isCompleted: false
    }));
  }
  next();
});

export default mongoose.model<ILifeChapter>('LifeChapter', LifeChapterSchema);
