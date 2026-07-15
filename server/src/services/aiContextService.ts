import mongoose from 'mongoose';
import User from '../models/User';
import ProgressionProfile from '../models/ProgressionProfile';
import FoodLog from '../models/FoodLog';
import WaterLog from '../models/WaterLog';
import Habit from '../models/Habit';
import HabitCompletion from '../models/HabitCompletion';
import WorkoutSession from '../models/WorkoutSession';
import Skill from '../models/Skill';
import DSAProblem from '../models/DSAProblem';
import WeightLog from '../models/WeightLog';
import { missionService } from '../services/missionService';
import { startOfDay, subDays, format } from 'date-fns';
import { GoogleGenAI } from '@google/genai';
import ConversationMessage from '../models/ConversationMessage';
import ConversationSummary from '../models/ConversationSummary';

let aiClient: GoogleGenAI;
const getAi = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
    });
  }
  return aiClient;
};

export const buildUserContext = async (userId: string): Promise<string> => {
  const contextSections: string[] = [];
  
  // 1. Profile
  try {
    const user = await User.findById(userId).lean();
    if (!user) return 'No user found.';
    
    const latestWeight = await WeightLog.findOne({ userId }).sort({ loggedAt: -1 }).lean();
    const weight = latestWeight ? latestWeight.weight : user.weight;

    contextSections.push(`
### PROFILE
Name: ${user.name}
Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'}
Height: ${user.height ? user.height + ' cm' : 'N/A'}, Weight: ${weight ? weight + ' kg' : 'N/A'}
Goal: ${user.fitnessGoal || 'N/A'}
Activity Level: ${user.activityLevel || 'N/A'}
Experience Level: ${user.experienceLevel || 'N/A'}
Macros Goal: ${user.dailyCalorieGoal || 'N/A'} kcal, ${user.dailyProteinGoal || 'N/A'}g protein, ${user.dailyWaterGoalLiters || 'N/A'}L water
    `.trim());
  } catch (e) {
    console.error('Error fetching Profile:', e);
  }

  // 2. Progression
  try {
    const profile = await ProgressionProfile.findOne({ userId }).lean();
    if (profile) {
      const achievements = profile.unlockedAchievements.map(a => a.achievementId).join(', ');
      contextSections.push(`
### PROGRESSION
Level: ${profile.level}, Rank: ${profile.rank}
Total XP: ${profile.totalXP}, Coins: ${profile.coins || 0}
Current Streak: ${profile.currentStreak} days (Longest: ${profile.longestStreak})
Unlocked Achievements: ${achievements || 'None'}
      `.trim());
    }
  } catch (e) {
    console.error('Error fetching Progression:', e);
  }

  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');
  const sevenDaysAgo = subDays(today, 6); // Last 7 days including today

  // 3. Today & Last 7 Days (Nutrition, Water, Workouts, Habits)
  try {
    // Nutrition
    const recentFood = await FoodLog.find({ userId, date: { $gte: format(sevenDaysAgo, 'yyyy-MM-dd') } }).lean() as any[];
    
    let caloriesToday = 0;
    let proteinToday = 0;
    const dailyNutrition: Record<string, { cals: number, pro: number }> = {};
    
    for (const log of recentFood) {
      if (!dailyNutrition[log.date]) dailyNutrition[log.date] = { cals: 0, pro: 0 };
      dailyNutrition[log.date].cals += (log.calories || 0);
      dailyNutrition[log.date].pro += (log.protein || 0);
      
      if (log.date === todayStr) {
        caloriesToday += (log.calories || 0);
        proteinToday += (log.protein || 0);
      }
    }
    
    const nutrition7Days = Object.keys(dailyNutrition).sort().map(d => `${d}: ${dailyNutrition[d].cals}kcal, ${dailyNutrition[d].pro}g pro`).join(' | ');

    // Water
    const waterTodayLogs = await WaterLog.find({ userId, date: todayStr }).lean() as any[];
    const waterToday = waterTodayLogs.reduce((acc, curr) => acc + curr.amountMl, 0);

    // Habits
    const activeHabits = await Habit.find({ userId, active: true }).lean() as any[];
    const recentCompletions = await HabitCompletion.find({ 
      userId, 
      date: { $gte: format(sevenDaysAgo, 'yyyy-MM-dd') } 
    }).lean() as any[];

    const completedTodayList = recentCompletions.filter(c => c.date === todayStr).map(c => c.habitId.toString());
    const habitsTodayContext = activeHabits.map(h => `- ${h.title}: ${completedTodayList.includes(h._id.toString()) ? '✅' : '❌'}`).join('\n');
    
    const totalPossibleHabits = activeHabits.length * 7;
    const habitCompletionRate = totalPossibleHabits > 0 ? Math.round((recentCompletions.length / totalPossibleHabits) * 100) : 0;

    // Workouts
    const recentWorkouts = await WorkoutSession.find({ 
      userId, 
      date: { $gte: sevenDaysAgo } 
    }).sort({ date: 1 }).lean() as any[];

    const workoutToday = recentWorkouts.find(w => format(new Date(w.date), 'yyyy-MM-dd') === todayStr);
    const workoutContext = workoutToday 
      ? `Yes (${workoutToday.name || 'Ad-hoc'}, Vol: ${workoutToday.totalVolume}kg, ${workoutToday.exercises?.length || 0} exercises)`
      : 'No';
      
    const workouts7Days = recentWorkouts.map(w => `${format(new Date(w.date), 'MMM d')}: ${w.name || 'Workout'}, Vol: ${w.totalVolume}`).join(' | ');

    contextSections.push(`
### TODAY
Calories: ${caloriesToday}, Protein: ${proteinToday}g, Water: ${waterToday}ml
Workout Logged: ${workoutContext}
Active Habits:
${habitsTodayContext}

### LAST 7 DAYS
Nutrition: ${nutrition7Days || 'No logs'}
Workouts: ${workouts7Days || 'None'}
Habit Completion Rate: ${habitCompletionRate}%
    `.trim());

  } catch (e) {
    console.error('Error fetching Daily/7-Day Stats:', e);
  }

  // 4. Skills
  try {
    const skills = await Skill.find({ userId }).sort({ level: -1 }).lean();
    if (skills.length > 0) {
      const skillsCtx = skills.map(s => `${s.name} (Lvl ${s.level})`).join(', ');
      contextSections.push(`### SKILLS\n${skillsCtx}`);
    }
  } catch (e) {
    console.error('Error fetching Skills:', e);
  }

  // 5. DSA
  try {
    const dsaProblems = await DSAProblem.find({ userId }).lean() as any[];
    if (dsaProblems.length > 0) {
      const needsRev = dsaProblems.filter(p => p.needsRevision).length;
      
      const topics: Record<string, number> = {};
      dsaProblems.forEach(p => {
        p.topic?.forEach((t: string) => {
          topics[t] = (topics[t] || 0) + 1;
        });
      });
      const topTopics = Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => `${t[0]} (${t[1]})`).join(', ');

      const dsa7Days = dsaProblems.filter(p => new Date(p.dateSolved) >= sevenDaysAgo).length;

      contextSections.push(`
### DSA (Data Structures & Algorithms)
Total Solved: ${dsaProblems.length}
Solved Last 7 Days: ${dsa7Days}
Top Topics: ${topTopics}
Needs Revision: ${needsRev} problems
      `.trim());
    }
  } catch (e) {
    console.error('Error fetching DSA:', e);
  }

  // 6. Quests & Boss
  try {
    const quests = await missionService.getDailyQuests(userId);
    const boss = await missionService.getCurrentBoss(userId);

    const questsCtx = quests.map((q: any) => `- ${q.title}: ${q.completed ? '✅' : `${q.current}/${q.target}`}`).join('\n');
    let bossCtx = 'No boss active';
    if (boss) {
      const b: any = boss;
      bossCtx = `Name: ${b.name}\n` + b.requirements.map((r: any) => `  - ${r.label}: ${r.current}/${r.target}`).join('\n');
    }

    contextSections.push(`
### QUESTS & BOSS
Daily Quests:
${questsCtx}

Weekly Boss:
${bossCtx}
    `.trim());
  } catch (e) {
    console.error('Error fetching Missions:', e);
  }

  return contextSections.join('\n\n');
};

export const compressMemory = async (userId: string) => {
  try {
    const messages = await ConversationMessage.find({ userId })
      .sort({ createdAt: 1 })
      .lean();
    
    // If fewer than 40 messages, don't compress
    if (messages.length < 40) return;

    // Take the oldest 20 messages to compress
    const msgsToCompress = messages.slice(0, 20);
    const msgsIds = msgsToCompress.map(m => m._id);

    // Fetch existing summary
    const summaryDoc = await ConversationSummary.findOne({ userId });
    const existingSummary = summaryDoc ? summaryDoc.summary : 'No previous summary.';

    const textToSummarize = msgsToCompress.map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `
You are ARIA, maintaining memory of your conversations with the user.
Here is the previous summary of older conversations:
"""${existingSummary}"""

Here is a block of new, older conversations to incorporate:
"""${textToSummarize}"""

Please provide an updated, concise summary of the user's journey, goals, struggles, and key facts. Focus on actionable insights, user preferences, and any important context for future conversations. Use bullet points. Keep it under 200 words.
    `.trim();

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const newSummary = response.text || existingSummary;

    // Upsert summary
    await ConversationSummary.findOneAndUpdate(
      { userId },
      { summary: newSummary, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Delete the compressed messages
    await ConversationMessage.deleteMany({ _id: { $in: msgsIds } });

  } catch (error) {
    console.error('Error compressing memory:', error);
  }
};

export const embedMessage = async (messageId: string) => {
  console.log(`[embedMessage] Starting embedding for message ID: ${messageId}`);
  try {
    const msg = await ConversationMessage.findById(messageId);
    if (!msg) {
      console.log(`[embedMessage] Message ${messageId} not found in DB.`);
      return;
    }
    if (!msg.content) {
      console.log(`[embedMessage] Message ${messageId} has no content.`);
      return;
    }
    if (msg.embedding && msg.embedding.length > 0) {
      console.log(`[embedMessage] Message ${messageId} already has an embedding of length ${msg.embedding.length}.`);
      return;
    }

    let generatedEmbedding: number[];

    if (process.env.GEMINI_API_KEY) {
      console.log(`[embedMessage] Calling Gemini API for embedding...`);
      const ai = getAi();
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: msg.content
      });
      console.log(`[embedMessage] Gemini response received.`);
      generatedEmbedding = response.embeddings?.[0]?.values || [];
    } else {
      console.log(`[embedMessage] No GEMINI_API_KEY detected. Generating mock 768-dimensional embedding...`);
      // Generate a mock 768-dimensional array of zeros
      generatedEmbedding = new Array(768).fill(0.123);
    }

    console.log(`[embedMessage] Embedding generated. Length: ${generatedEmbedding.length}`);

    // Directly update the DB document to be sure
    const updateResult = await ConversationMessage.updateOne(
      { _id: messageId },
      { $set: { embedding: generatedEmbedding } }
    );
    
    console.log(`[embedMessage] MongoDB updateResult: modifiedCount=${updateResult.modifiedCount}`);

    const finalMsg = await ConversationMessage.findById(messageId).lean();
    console.log(`[embedMessage] Final saved document embedding length: ${finalMsg?.embedding?.length || 0}`);
    
  } catch (error) {
    console.error(`[embedMessage] Error embedding message ${messageId}:`, error);
  }
};

export const vectorSearchContext = async (userId: string, query: string): Promise<string> => {
  try {
    // Note: This requires the Atlas Vector Search index to be created manually on the collection
    const ai = getAi();
    const queryEmbeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: query
    });
    
    const queryEmbedding = queryEmbeddingResponse.embeddings?.[0]?.values;
    if (!queryEmbedding) return '';

    // Use aggregation pipeline for vector search
    const results = await ConversationMessage.aggregate([
      {
        $vectorSearch: {
          index: 'vectorSearchIndex',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: { userId: { $eq: new mongoose.Types.ObjectId(userId) } }
        }
      },
      {
        $project: {
          _id: 0,
          role: 1,
          content: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);

    // Filter by similarity threshold (e.g., > 0.6)
    const relevantMsgs = results.filter(r => r.score > 0.6);

    if (relevantMsgs.length === 0) return '';

    return '### RELEVANT PAST CONVERSATIONS\n' + 
      relevantMsgs.map(r => `${r.role === 'assistant' ? 'ARIA' : 'User'}: ${r.content}`).join('\n\n');

  } catch (error) {
    console.error('Vector search failed (likely missing index):', error);
    return '';
  }
};
