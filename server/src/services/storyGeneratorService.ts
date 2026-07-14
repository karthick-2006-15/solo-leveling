import { generateAriaResponse } from './ariaPromptService';
import UserStoryChapter from '../models/StoryChapter';
import QuestInstance from '../models/QuestInstance';
import WorkoutSession from '../models/WorkoutSession';
import ProgressionProfile from '../models/ProgressionProfile';
import User from '../models/User';

class StoryGeneratorService {
  async generateDailyChapter(userId: string) {
    try {
      // 1. Gather Daily Data
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      const profile = await ProgressionProfile.findOne({ userId });
      if (!profile) return;

      const quests = await QuestInstance.find({ userId, updatedAt: { $gte: startOfDay } });
      const completedQuests = quests.filter(q => q.status === 'completed');
      const failedQuests = quests.filter(q => q.status === 'failed');
      const workouts = await WorkoutSession.find({ userId, date: { $gte: startOfDay } });

      // If absolutely nothing happened, maybe don't generate a chapter, or generate a "rest day" chapter if they logged sleep.
      if (quests.length === 0 && workouts.length === 0) {
        return; // Nothing to report
      }

      // 2. Build Context Prompt
      const contextPrompt = `
      Write a short, epic "Solo Leveling" style web novel chapter summarizing the user's real-life day.
      User Level: ${profile.level}, Rank: ${profile.rank}, Title: ${profile.hunterTitle || 'Beginner Hunter'}.
      Today they completed ${completedQuests.length} quests and failed ${failedQuests.length}.
      They completed ${workouts.length} training sessions.
      
      Details of achievements today:
      ${completedQuests.map(q => `- Conquered: ${q.title}`).join('\n')}
      ${workouts.map(w => `- Trained for ${w.durationMinutes} mins`).join('\n')}
      
      Make it dramatic, no more than 3 paragraphs. Focus on their growth as a Hunter facing the system.
      Do not include greetings. Just the story.`;

      // 3. Ask AI
      const storyContent = await generateAriaResponse(
        "You are the Architect, writing the epic tale of the Hunter.",
        contextPrompt
      );

      // 4. Save Chapter
      const chapterCount = await UserStoryChapter.countDocuments({ userId });
      const nextChapterNumber = chapterCount + 1;
      
      const newChapter = new UserStoryChapter({
        userId,
        chapterNumber: nextChapterNumber,
        title: `Chapter ${nextChapterNumber}: The Daily Grind`,
        content: storyContent,
        isUnlocked: true,
        unlockedAt: new Date()
      });

      await newChapter.save();
      console.log(`[STORY] Generated Chapter ${nextChapterNumber} for user ${userId}`);

    } catch (err) {
      console.error(`[STORY] Failed to generate chapter for user ${userId}:`, err);
    }
  }

  async runGlobalDailyRecap() {
    console.log('[STORY] Running global daily recaps...');
    const users = await User.find({ isActive: true });
    for (const user of users) {
      await this.generateDailyChapter(user._id.toString());
    }
  }
}

export const storyGeneratorService = new StoryGeneratorService();
