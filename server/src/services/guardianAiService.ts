import { GoogleGenAI } from '@google/genai';
import { IRecoveryProfile } from '../models/RecoveryProfile';
import { IGuardianLog } from '../models/GuardianLog';

export class GuardianAiService {
  private aiClient: GoogleGenAI;

  constructor() {
    this.aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
    });
  }

  async generateNightReport(profile: IRecoveryProfile, recentLogs: any[]): Promise<string> {
    const prompt = `
      You are Iggris, a system administrator and coach for a user on a journey to overcome compulsive porn addiction.
      The user's current status:
      - Current Streak: ${profile.currentStreak} days
      - Longest Streak: ${profile.longestStreak} days
      - Willpower: ${profile.willpower}/100
      - Corruption: ${profile.corruption}/100
      - Urges Resisted Today: ${recentLogs.filter(l => l.actionType === 'urge_resisted').length}

      Generate a "Night Mission Report". The tone should be supportive, analytic, and inspiring (Solo Leveling theme). 
      Do NOT use guilt or shame. Frame setbacks as damage taken, and successes as leveling up.
      
      Include:
      1. Strongest Achievement of the day
      2. Biggest Challenge faced
      3. Estimated Trigger Patterns (analyze if any relapses or urges occurred)
      4. Personalized Recommendation for tomorrow
      
      Keep it concise (under 250 words) and format in Markdown.
    `;

    try {
      const response = await this.aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return response.text || "Report generation failed. Keep fighting.";
    } catch (e) {
      console.error('Error generating Night Report:', e);
      return "Iggris offline. Rest well, Hunter. The system will reboot tomorrow.";
    }
  }

  async predictTriggers(recentLogs: any[]): Promise<string> {
    const prompt = `
      You are Iggris, an AI analyzing a user's recovery logs to predict their next high-risk period for relapse or urges.
      Here are the recent logs:
      ${JSON.stringify(recentLogs.map(l => ({ action: l.actionType, time: l.timestamp, emotion: l.emotion, context: l.triggerContext })), null, 2)}
      
      Identify the most common time of day, emotion, or context that triggers the user.
      Provide a 2-sentence proactive coaching message to send to the user before this high-risk period. Focus on resilience and healthy choices.
    `;

    try {
      const response = await this.aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return response.text || "Maintain your guard. Triggers are unpredictable.";
    } catch (e) {
      return "Maintain your guard. Triggers are unpredictable.";
    }
  }
}

export const guardianAiService = new GuardianAiService();
