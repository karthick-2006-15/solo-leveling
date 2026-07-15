import mongoose from 'mongoose';
import ScreenTimeLog, { IScreenTimeLog } from '../models/ScreenTimeLog';
import AppClassification from '../models/AppClassification';
import DistractionBoss from '../models/DistractionBoss';
import { AIParsedScreenTime, analyzeScreenTimeImage } from './screenTimeAiService';
import { AppError } from '../utils/AppError';
import { startOfDay } from 'date-fns';

export interface ScreenTimeInput {
  totalTimeMinutes: number;
  apps: Array<{
    name: string;
    minutes: number;
    categoryGuess?: string;
  }>;
}

export const screenTimeService = {
  
  async getDashboardData(userId: string) {
    const today = startOfDay(new Date());
    const log = await ScreenTimeLog.findOne({ userId, date: today });
    const boss = await DistractionBoss.findOne({ userId });
    
    // Get last 7 days for trend
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyLogs = await ScreenTimeLog.find({
      userId,
      date: { $gte: weekAgo }
    }).sort({ date: 1 });

    return {
      today: log,
      boss,
      weeklyLogs
    };
  },

  async processScreenTime(userId: string, input: ScreenTimeInput) {
    const today = startOfDay(new Date());
    
    // Ensure DistractionBoss exists
    let boss = await DistractionBoss.findOne({ userId });
    if (!boss) {
      boss = await DistractionBoss.create({ userId });
    }

    // Process Apps and Classifications
    let productiveTime = 0;
    let unproductiveTime = 0;
    let neutralTime = 0;
    
    const categoryTotals: Record<string, number> = {
      socialMediaMinutes: 0,
      gamingMinutes: 0,
      learningMinutes: 0,
      readingMinutes: 0,
      codingMinutes: 0,
      entertainmentMinutes: 0,
      communicationMinutes: 0,
      neutralMinutes: 0
    };

    const validatedApps = [];

    for (const app of input.apps) {
      // Find or create classification
      let classification = await AppClassification.findOne({ userId, appName: app.name });
      
      if (!classification) {
        // AI guessed categories vs strict enums mapping
        let cat = app.categoryGuess || 'neutral';
        if (cat === 'coding' || cat === 'reading') cat = 'learning'; // Map subcategories if needed
        const validCategories = ['productive', 'learning', 'social_media', 'gaming', 'entertainment', 'communication', 'neutral'];
        if (!validCategories.includes(cat)) cat = 'neutral';
        
        classification = await AppClassification.create({
          userId,
          appName: app.name,
          category: cat
        });
      }

      const cat = classification.category;
      validatedApps.push({
        name: app.name,
        minutes: app.minutes,
        category: cat
      });

      // Calculate productivity buckets
      if (['productive', 'learning'].includes(cat)) {
        productiveTime += app.minutes;
      } else if (['social_media', 'gaming', 'entertainment'].includes(cat)) {
        unproductiveTime += app.minutes;
      } else {
        neutralTime += app.minutes;
      }

      // Update specific category fields
      if (cat === 'social_media') categoryTotals.socialMediaMinutes += app.minutes;
      if (cat === 'gaming') categoryTotals.gamingMinutes += app.minutes;
      if (cat === 'learning') categoryTotals.learningMinutes += app.minutes;
      if (cat === 'entertainment') categoryTotals.entertainmentMinutes += app.minutes;
      if (cat === 'communication') categoryTotals.communicationMinutes += app.minutes;
      if (cat === 'neutral') categoryTotals.neutralMinutes += app.minutes;
    }

    // If totalTimeMinutes was not fully supplied or apps sum to more, reconcile
    const sumOfApps = input.apps.reduce((acc, curr) => acc + curr.minutes, 0);
    const totalTimeMinutes = Math.max(input.totalTimeMinutes, sumOfApps);

    // Calculate Intelligence Scores
    // Focus Score: Productive / Total * 100
    let focusScore = 0;
    if (totalTimeMinutes > 0) {
      focusScore = Math.round((productiveTime / totalTimeMinutes) * 100);
    }
    
    // Dopamine Impact: Heavy penalty for excessive gaming/social media
    const dopamineImpact = Math.round((unproductiveTime / 60) * 15);
    
    // Corruption Increase: Unproductive time creates system corruption
    const corruptionIncrease = Math.round(unproductiveTime * 0.5);

    const timeLost = unproductiveTime;
    const potentialTimeRecovered = Math.max(0, unproductiveTime - 60); // Anything over 1h could have been recovered

    // Boss Mechanics
    // Boss heals from Unproductive Time, Takes Damage from Productive Time
    const bossHeal = unproductiveTime * 2;
    const bossDamage = productiveTime * 1.5;
    
    boss.currentHp = Math.min(boss.maxHp, boss.currentHp + bossHeal);
    boss.currentHp = Math.max(0, boss.currentHp - bossDamage);

    if (boss.currentHp <= 0) {
      // Boss Defeated!
      boss.isDefeated = true;
      boss.defeatedCount += 1;
      boss.level += 1;
      boss.maxHp = Math.floor(boss.maxHp * 1.5); // Gets stronger
      boss.currentHp = boss.maxHp; // Respawns instantly for the next battle
      boss.isDefeated = false; // Reset state after leveling
    }
    
    await boss.save();

    // Upsert ScreenTimeLog
    const log = await ScreenTimeLog.findOneAndUpdate(
      { userId, date: today },
      {
        $set: {
          totalTimeMinutes,
          productiveTimeMinutes: productiveTime,
          unproductiveTimeMinutes: unproductiveTime,
          ...categoryTotals,
          apps: validatedApps,
          focusScore,
          productivityScore: focusScore, // mapped similarly for now
          corruptionIncrease,
          dopamineImpact,
          timeLost,
          potentialTimeRecovered
        }
      },
      { upsert: true, new: true }
    );

    return { log, boss };
  },

  async processImageUpload(userId: string, base64Image: string, mimeType: string) {
    // 1. AI Parse
    const parsedData = await analyzeScreenTimeImage(base64Image, mimeType);
    // 2. Process logic
    return await this.processScreenTime(userId, parsedData);
  },

  async getAppClassifications(userId: string) {
    return await AppClassification.find({ userId }).sort({ appName: 1 });
  },

  async updateAppClassification(userId: string, classificationId: string, category: string) {
    const cls = await AppClassification.findOneAndUpdate(
      { _id: classificationId, userId },
      { category },
      { new: true }
    );
    if (!cls) throw new AppError('Classification not found', 404);
    
    // If we wanted to retroactively update today's screen time, we could trigger a recalc here.
    return cls;
  }
};
