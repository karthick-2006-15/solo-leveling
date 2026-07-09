import StoryChapter from '../models/StoryChapter';
import ProgressionProfile from '../models/ProgressionProfile';

const STORY_DATA = [
  {
    chapterNumber: 1,
    title: 'Awakening',
    content: '# The System Awakens\n\nYou were the weakest. But the system chose you. Now, your life is a game, and the only way out is to level up.',
    unlockConditions: { requiredLevel: 1 }
  },
  {
    chapterNumber: 2,
    title: 'The First Dungeon',
    content: '# Stepping into the Gate\n\nThe air feels heavy. The first challenge lies ahead. This is where you prove you are no longer the weakest.',
    unlockConditions: { requiredLevel: 5 }
  },
  {
    chapterNumber: 3,
    title: 'Rise of Discipline',
    content: '# Forging the Iron Will\n\nMotivation fades, but discipline remains. The Inner Monarch begins to stir within you.',
    unlockConditions: { requiredLevel: 15 }
  }
];

class StoryService {
  async checkStoryProgression(userId: string) {
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) return;

    for (const chapter of STORY_DATA) {
      // Check if user already unlocked this chapter
      const existing = await StoryChapter.findOne({ userId, chapterNumber: chapter.chapterNumber });
      
      if (!existing) {
        // Check conditions
        if (profile.level >= (chapter.unlockConditions.requiredLevel || 1)) {
          // Unlock
          await StoryChapter.create({
            userId,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            content: chapter.content,
            isUnlocked: true,
            unlockedAt: new Date()
          });
        }
      }
    }
  }

  async getUnlockedChapters(userId: string) {
    return await StoryChapter.find({ userId, isUnlocked: true }).sort({ chapterNumber: 1 });
  }
}

export const storyService = new StoryService();
