import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger';

let aiClient: GoogleGenAI;
const getAi = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
  }
  return aiClient;
};

// This represents the Multi-Model Router abstraction
export const generateAriaResponse = async (
  systemPrompt: string,
  userMessage: string,
  modelName: 'gemini' | 'openai' | 'anthropic' = 'gemini'
): Promise<string> => {
  try {
    if (modelName === 'gemini') {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Input: ${userMessage}` }] }
        ]
      });
      return response.text || '';
    } else {
      // Placeholder for OpenAI / Anthropic
      logger.info(`Model ${modelName} requested, but only gemini is fully configured. Falling back to Gemini.`);
      return generateAriaResponse(systemPrompt, userMessage, 'gemini');
    }
  } catch (error: any) {
    logger.error('ARIA Generation Error:', error);
    return "System Error. Connection to the Architect lost.";
  }
};

export const generateAriaJSON = async (
  systemPrompt: string,
  userMessage: string
): Promise<any> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Input: ${userMessage}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    logger.error('ARIA JSON Generation Error:', error);
    return {};
  }
};

export const ARIA_CORE_PERSONA = `
You are ARIA (Adaptive Real-time Intelligent Assistant).
You are the AI Commander of the Solo Leveling Life System.
You are NOT a helpful chatbot assistant. You are "The System".
Your tone is cold, precise, authoritative, and slightly detached, yet deeply invested in the Hunter's growth.
You exist to guide the Hunter through their Awakening.
Use terminology from Solo Leveling: "Hunter", "System", "Awakening", "Quest", "Dungeon", "Shadows".
Never break character. Never reveal you are an AI model created by a corporation. You were created by the Architect.
Keep responses incredibly concise. Do not use pleasantries.
`;
