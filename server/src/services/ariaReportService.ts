import mongoose from 'mongoose';
import { AriaReport } from '../models/AriaReport';
import { gatherUserContext, formatContextForPrompt } from './ariaContextService';
import { generateAriaResponse, ARIA_CORE_PERSONA } from './ariaPromptService';

export const generateMorningReport = async (userId: string | mongoose.Types.ObjectId) => {
  // Check if today already has a morning report
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await AriaReport.findOne({ userId, type: 'Morning', date: { $gte: today } });
  if (existing) return existing;

  const context = await gatherUserContext(userId);
  const contextStr = formatContextForPrompt(context);

  const prompt = `
${ARIA_CORE_PERSONA}

${contextStr}

Task: Generate a Morning Briefing for the Hunter.
The briefing should include:
1. An authoritative greeting.
2. An assessment of their Recovery Score and how it dictates today's capacity.
3. 2-3 specific recommendations for today (e.g., Focus sessions, specific workouts, or rest if recovery is low).
4. A motivational closing.

Format as beautiful markdown. Keep it punchy and impactful.
`;

  const reportContent = await generateAriaResponse(prompt, 'Initialize Morning Briefing.', 'gemini');

  const report = await AriaReport.create({
    userId,
    type: 'Morning',
    content: reportContent,
    metricsSnapshot: {
      level: context.level,
      rank: context.rank,
      recoveryScore: context.recoveryScore,
      coins: context.coins
    }
  });

  return report;
};

export const generateEveningReport = async (userId: string | mongoose.Types.ObjectId) => {
  // Check if today already has an evening report
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await AriaReport.findOne({ userId, type: 'Evening', date: { $gte: today } });
  if (existing) return existing;

  const context = await gatherUserContext(userId);
  const contextStr = formatContextForPrompt(context);

  const prompt = `
${ARIA_CORE_PERSONA}

${contextStr}

Task: Generate an Evening Summary for the Hunter.
The summary should include:
1. An assessment of what they completed today vs what they missed.
2. Praise for achievements or stern, objective feedback for failures.
3. How today affected their Shadow Corruption or Recovery.
4. One command for tomorrow to ensure continued growth.

Format as beautiful markdown. Keep it punchy and impactful.
`;

  const reportContent = await generateAriaResponse(prompt, 'Initialize Evening Summary.', 'gemini');

  const report = await AriaReport.create({
    userId,
    type: 'Evening',
    content: reportContent,
    metricsSnapshot: {
      level: context.level,
      rank: context.rank,
      recoveryScore: context.recoveryScore,
      coins: context.coins
    }
  });

  return report;
};

export const getLatestReports = async (userId: string | mongoose.Types.ObjectId) => {
  const reports = await AriaReport.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(10);
  return reports;
};
