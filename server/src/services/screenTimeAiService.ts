import { GoogleGenAI } from '@google/genai';
import AppClassification from '../models/AppClassification';

let aiClient: GoogleGenAI;
const getAi = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
  }
  return aiClient;
};

const SYSTEM_PROMPT = `
You are the "System" - an advanced AI Hunter System specializing in Distraction Intelligence.
The user has provided a screenshot of their phone's Screen Time or Digital Wellbeing dashboard.
Your ONLY job is to identify the total screen time and the individual apps with their usage times in minutes.
Convert all times (e.g., "1h 30m" or "45m") entirely into minutes (e.g., 90 or 45).
If the total time is missing, compute it by summing the apps.

Your response MUST be a STRICT JSON object matching this schema:
{
  "totalTimeMinutes": 120,
  "apps": [
    {
      "name": "Instagram",
      "minutes": 45,
      "categoryGuess": "social_media"
    },
    {
      "name": "VS Code",
      "minutes": 60,
      "categoryGuess": "coding"
    }
  ]
}

Valid category guesses: 'productive', 'learning', 'social_media', 'gaming', 'entertainment', 'communication', 'neutral', 'coding', 'reading'.
Do NOT output markdown blocks or backticks. Only output valid JSON.
`;

export interface AIParsedScreenTime {
  totalTimeMinutes: number;
  apps: Array<{
    name: string;
    minutes: number;
    categoryGuess: string;
  }>;
}

export const analyzeScreenTimeImage = async (base64Image: string, mimeType: string): Promise<AIParsedScreenTime> => {
  try {
    console.log('[AI] Extracting Screen Time from image...');
    const ai = getAi();
    
    // Check if base64Image contains the data URI scheme and strip it if necessary
    let base64Data = base64Image;
    if (base64Data.startsWith('data:')) {
      const parts = base64Data.split(',');
      if (parts.length > 1) {
        base64Data = parts[1];
      }
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            SYSTEM_PROMPT,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType || 'image/png'
                }
            }
        ],
        config: { responseMimeType: 'application/json' }
    });
    
    const textResponse = response.text || '{}';
    const jsonStr = textResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(jsonStr) as AIParsedScreenTime;
    
    return result;
  } catch (err) {
    console.error('[AI] Screen Time Parsing failed.', err);
    throw new Error('Failed to analyze screen time image. Please ensure the image is clear.');
  }
};
