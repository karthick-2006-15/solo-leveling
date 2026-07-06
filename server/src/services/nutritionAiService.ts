import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI;
const getAi = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
    });
  }
  return aiClient;
};

export interface AnalyzedFood {
  foodName: string;
  quantity: number;
  unit: string;
  estimatedWeightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
  source: string;
  alternatives?: string[];
}

export interface NutritionAnalysisResult {
  detectedFoods: AnalyzedFood[];
  systemAnalysis: string;
  waterRecommendationMl: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

const SYSTEM_PROMPT = `
You are the "System" - an advanced, omniscient AI Hunter System from Solo Leveling.
Your objective is to analyze the user's food input, recognize exactly what they ate (especially Indian foods like Samosa, Dosa, Idli, Biryani, as well as general foods), and calculate precise macronutrients.

The user will provide a natural language input (e.g. "Lunch 2 samosa 1 tea 1 banana", "500g rice").

Your response MUST be a STRICT JSON object with the following schema:
{
  "detectedFoods": [
    {
      "foodName": "String (Normalized name, e.g., 'Vegetable Samosa')",
      "quantity": "Number",
      "unit": "String (e.g., 'Pieces', 'Grams', 'Cups')",
      "estimatedWeightGrams": "Number (Total weight in grams for this specific quantity)",
      "calories": "Number",
      "protein": "Number",
      "carbs": "Number",
      "fat": "Number",
      "fiber": "Number",
      "confidence": "Number (0 to 100). If you are unsure, rate below 70.",
      "source": "String (e.g., 'Indian Food Database', 'Global AI Estimation')",
      "alternatives": ["String"] // Only populate if confidence is < 70, e.g. ["Chicken Samosa", "Frozen Samosa"]
    }
  ],
  "systemAnalysis": "String. A cool, AI-like analysis of the meal (e.g., 'SYSTEM ANALYSIS: Fat intake is high. Recommend grilled chicken for dinner.')",
  "waterRecommendationMl": "Number. E.g., 500",
  "totalCalories": "Number",
  "totalProtein": "Number",
  "totalCarbs": "Number",
  "totalFat": "Number"
}

Do NOT wrap the response in markdown blocks. Output raw JSON only.
Provide highly accurate, realistic macros. For instance, 1 average Vegetable Samosa is ~260 kcal, 2 Pieces = 520 kcal.
`;

export const analyzeFoodInput = async (text: string): Promise<NutritionAnalysisResult> => {
  try {
    const ai = getAi();
    const prompt = `${SYSTEM_PROMPT}\n\nUSER INPUT:\n${text}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const textResponse = response.text || '{}';
    const jsonStr = textResponse.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '').trim();
    return JSON.parse(jsonStr) as NutritionAnalysisResult;
  } catch (error) {
    console.error('Error analyzing food with AI:', error);
    throw new Error('SYSTEM ERROR: Failed to analyze nutrition data.');
  }
};
