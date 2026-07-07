import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

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

const SIMPLE_FOOD_REGEX = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/i;

async function parseSimpleFood(text: string): Promise<NutritionAnalysisResult | null> {
  const match = text.trim().match(SIMPLE_FOOD_REGEX);
  if (!match) return null;

  if (text.length > 50) return null; // Avoid confusing natural language with simple inputs

  const quantityStr = match[1];
  let unit = match[2] || 'Pieces';
  let foodName = match[3];

  const commonUnits = ['g', 'ml', 'cup', 'cups', 'piece', 'pieces', 'slice', 'slices', 'bowl', 'plate', 'kg', 'tbsp', 'tsp'];
  if (unit && !commonUnits.includes(unit.toLowerCase())) {
    foodName = `${unit} ${foodName}`;
    unit = 'Pieces';
  }

  const quantity = parseFloat(quantityStr);

  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${apiKey}&pageSize=1`;
    const response = await axios.get(url);

    if (response.data && response.data.foods && response.data.foods.length > 0) {
      const food = response.data.foods[0];
      
      let multiplier = quantity;
      let estimatedWeightGrams = quantity * 100;

      if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'ml') {
         multiplier = quantity / 100;
         estimatedWeightGrams = quantity;
      } else {
        const portion = food.foodPortions?.find((p: any) => p.gramWeight);
        if (portion && portion.gramWeight) {
          estimatedWeightGrams = quantity * portion.gramWeight;
          multiplier = estimatedWeightGrams / 100;
        }
      }

      const getNutrient = (id: number) => {
        const nut = food.foodNutrients.find((n: any) => n.nutrientId === id);
        return nut ? nut.value * multiplier : 0;
      };

      const calories = getNutrient(1008); 
      const protein = getNutrient(1003); 
      const fat = getNutrient(1004); 
      const carbs = getNutrient(1005); 
      const fiber = getNutrient(1079); 

      const analyzedFood: AnalyzedFood = {
        foodName: food.description,
        quantity,
        unit,
        estimatedWeightGrams: Math.round(estimatedWeightGrams),
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
        fiber: Math.round(fiber),
        confidence: 95,
        source: 'USDA Database (Local Parse)'
      };

      console.log('[Parser] Success');

      return {
        detectedFoods: [analyzedFood],
        systemAnalysis: "SYSTEM ANALYSIS: Target acquired and mapped perfectly. No additional processing required.",
        waterRecommendationMl: 0,
        totalCalories: analyzedFood.calories,
        totalProtein: analyzedFood.protein,
        totalCarbs: analyzedFood.carbs,
        totalFat: analyzedFood.fat
      };
    }
  } catch (err) {
    // Silently fail local parse and fall back to AI
  }

  return null;
}

async function callGroq(prompt: string): Promise<NutritionAnalysisResult> {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );

  const textResponse = response.data.choices[0].message.content;
  return JSON.parse(textResponse) as NutritionAnalysisResult;
}

async function callOpenRouter(prompt: string): Promise<NutritionAnalysisResult> {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'meta-llama/llama-3-70b-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sololeveling.app'
      },
      timeout: 15000
    }
  );

  const textResponse = response.data.choices[0].message.content;
  return JSON.parse(textResponse) as NutritionAnalysisResult;
}

async function callGemini(prompt: string): Promise<NutritionAnalysisResult> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${SYSTEM_PROMPT}\\n\\n${prompt}`,
    config: {
      responseMimeType: 'application/json',
    }
  });

  const textResponse = response.text || '{}';
  const jsonStr = textResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(jsonStr) as NutritionAnalysisResult;
}

function getGracefulFallback(): NutritionAnalysisResult {
  return {
    detectedFoods: [],
    systemAnalysis: "Hunter System temporarily unavailable. Basic nutrition analysis could not be completed.",
    waterRecommendationMl: 0,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  };
}

export const analyzeFoodInput = async (text: string): Promise<NutritionAnalysisResult> => {
  // Priority 1: Local Food Parser
  if (text.length < 100) {
    const localResult = await parseSimpleFood(text);
    if (localResult) return localResult;
  }

  const prompt = `USER INPUT:\\n${text}`;

  // Priority 3: Groq API
  try {
    if (process.env.GROQ_API_KEY) {
      console.log('[Groq] Using AI');
      return await callGroq(prompt);
    } else {
      throw new Error('Missing GROQ_API_KEY');
    }
  } catch (err: any) {
    console.log('[Groq] Failed');
    console.log('Switching to OpenRouter...');
  }

  // Priority 4: OpenRouter API
  try {
    if (process.env.OPENROUTER_API_KEY) {
      return await callOpenRouter(prompt);
    } else {
      throw new Error('Missing OPENROUTER_API_KEY');
    }
  } catch (err: any) {
    console.log('[OpenRouter] Failed');
    console.log('Switching to Gemini...');
  }

  // Priority 5: Gemini API
  try {
    if (process.env.GEMINI_API_KEY) {
      return await callGemini(prompt);
    } else {
      throw new Error('Missing GEMINI_API_KEY');
    }
  } catch (err: any) {
    console.log('[Gemini] Failed');
    console.log('Returning graceful fallback.');
  }

  // Graceful Fallback
  return getGracefulFallback();
};
