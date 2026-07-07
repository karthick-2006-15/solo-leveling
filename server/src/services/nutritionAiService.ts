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

interface LocalFoodDefinition {
  isHardcoded: boolean;
  search: string;
  expectedCalsPer100g?: number;
  macrosPer100g?: { cals: number, prot: number, fat: number, carb: number, fiber: number };
  macrosPerPiece?: { cals: number, prot: number, fat: number, carb: number, fiber: number };
  defaultWeightGramsPerPiece?: number;
}

const LOCAL_FOOD_DICT: Record<string, LocalFoodDefinition> = {
  "rice": { isHardcoded: false, search: "cooked white rice", expectedCalsPer100g: 130 },
  "boiled rice": { isHardcoded: false, search: "cooked white rice", expectedCalsPer100g: 130 },
  "banana": { isHardcoded: false, search: "banana, raw", expectedCalsPer100g: 89, defaultWeightGramsPerPiece: 118 },
  "egg": { isHardcoded: false, search: "whole egg, raw", expectedCalsPer100g: 143, defaultWeightGramsPerPiece: 50 },
  "milk": { isHardcoded: false, search: "milk, whole, 3.25%", expectedCalsPer100g: 61, defaultWeightGramsPerPiece: 240 },
  "apple": { isHardcoded: false, search: "apple, raw", expectedCalsPer100g: 52, defaultWeightGramsPerPiece: 182 },
  "curd": { isHardcoded: false, search: "yogurt, plain, whole milk", expectedCalsPer100g: 61 },
  "paneer": { isHardcoded: false, search: "cheese, paneer", expectedCalsPer100g: 265 },
  "dosa": { isHardcoded: true, search: "Dosa (Plain)", macrosPerPiece: { cals: 133, prot: 3, fat: 3, carb: 23, fiber: 1 }, defaultWeightGramsPerPiece: 80 },
  "idli": { isHardcoded: true, search: "Idli", macrosPerPiece: { cals: 58, prot: 2, fat: 0.2, carb: 12, fiber: 1.5 }, defaultWeightGramsPerPiece: 40 },
  "chapati": { isHardcoded: true, search: "Chapati", macrosPerPiece: { cals: 104, prot: 3, fat: 1.5, carb: 20, fiber: 3 }, defaultWeightGramsPerPiece: 40 },
  "roti": { isHardcoded: true, search: "Roti", macrosPerPiece: { cals: 104, prot: 3, fat: 1.5, carb: 20, fiber: 3 }, defaultWeightGramsPerPiece: 40 },
  "sambar": { isHardcoded: true, search: "Sambar", macrosPer100g: { cals: 75, prot: 3, fat: 2, carb: 11, fiber: 2 }, defaultWeightGramsPerPiece: 150 },
  "rasam": { isHardcoded: true, search: "Rasam", macrosPer100g: { cals: 45, prot: 1, fat: 1.5, carb: 7, fiber: 1 }, defaultWeightGramsPerPiece: 150 },
  "medu vada": { isHardcoded: true, search: "Medu Vada", macrosPerPiece: { cals: 97, prot: 3, fat: 5, carb: 10, fiber: 1 }, defaultWeightGramsPerPiece: 35 },
  "vada": { isHardcoded: true, search: "Medu Vada", macrosPerPiece: { cals: 97, prot: 3, fat: 5, carb: 10, fiber: 1 }, defaultWeightGramsPerPiece: 35 },
  "poha": { isHardcoded: true, search: "Poha", macrosPer100g: { cals: 180, prot: 4, fat: 5, carb: 30, fiber: 2 }, defaultWeightGramsPerPiece: 150 },
  "upma": { isHardcoded: true, search: "Upma", macrosPer100g: { cals: 130, prot: 4, fat: 4, carb: 18, fiber: 2 }, defaultWeightGramsPerPiece: 150 },
  "biryani": { isHardcoded: true, search: "Chicken Biryani", macrosPer100g: { cals: 160, prot: 8, fat: 6, carb: 18, fiber: 1 }, defaultWeightGramsPerPiece: 350 },
  "chicken curry": { isHardcoded: true, search: "Chicken Curry", macrosPer100g: { cals: 130, prot: 12, fat: 8, carb: 4, fiber: 1 }, defaultWeightGramsPerPiece: 200 },
  "fish curry": { isHardcoded: true, search: "Fish Curry", macrosPer100g: { cals: 110, prot: 10, fat: 6, carb: 4, fiber: 0.5 }, defaultWeightGramsPerPiece: 200 }
};

const COMMON_UNITS = ['g', 'ml', 'cup', 'cups', 'piece', 'pieces', 'slice', 'slices', 'bowl', 'plate', 'kg', 'tbsp', 'tsp'];

async function parseSimpleFood(text: string): Promise<NutritionAnalysisResult | null> {
  if (text.length > 100) return null; // Too complex for simple parsing

  const chunks = text.split(/\b(?:and|with|&|,)\b/i).map(c => c.trim()).filter(Boolean);
  const detectedFoods: AnalyzedFood[] = [];
  
  for (const chunk of chunks) {
    let quantity = 1;
    let unit = 'Pieces';
    let foodName = chunk;

    const match = chunk.match(SIMPLE_FOOD_REGEX);
    if (match) {
      quantity = parseFloat(match[1]);
      const potentialUnit = match[2];
      const rest = match[3];
      
      if (potentialUnit && COMMON_UNITS.includes(potentialUnit.toLowerCase())) {
        unit = potentialUnit;
        foodName = rest;
      } else {
        foodName = potentialUnit ? `${potentialUnit} ${rest}` : rest;
      }
    }

    foodName = foodName.trim().toLowerCase();
    
    // Remove pluralization for better matching (e.g. bananas -> banana)
    const singularName = foodName.endsWith('s') && !foodName.endsWith('ss') ? foodName.slice(0, -1) : foodName;
    
    const dictEntry = LOCAL_FOOD_DICT[foodName] || LOCAL_FOOD_DICT[singularName];
    
    if (dictEntry && dictEntry.isHardcoded) {
      let multiplier = quantity;
      let estWeight = quantity * (dictEntry.defaultWeightGramsPerPiece || 100);
      
      if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'ml') {
        estWeight = quantity;
        multiplier = dictEntry.macrosPer100g ? (quantity / 100) : (quantity / (dictEntry.defaultWeightGramsPerPiece || 100));
      } else {
        multiplier = dictEntry.macrosPerPiece ? quantity : (estWeight / 100);
      }
      
      const macros = dictEntry.macrosPerPiece || dictEntry.macrosPer100g || { cals: 0, prot: 0, fat: 0, carb: 0, fiber: 0 };
      
      detectedFoods.push({
        foodName: dictEntry.search,
        quantity,
        unit,
        estimatedWeightGrams: Math.round(estWeight),
        calories: Math.round(macros.cals * multiplier),
        protein: Math.round(macros.prot * multiplier),
        carbs: Math.round(macros.carb * multiplier),
        fat: Math.round(macros.fat * multiplier),
        fiber: Math.round(macros.fiber * multiplier),
        confidence: 100,
        source: 'Hunter Database (Verified)'
      });
      continue;
    }

    const searchQuery = dictEntry ? dictEntry.search : foodName;
    const expectedCalsPer100g = dictEntry ? dictEntry.expectedCalsPer100g : null;

    try {
      const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&pageSize=20`;
      const response = await axios.get(url);

      if (response.data && response.data.foods && response.data.foods.length > 0) {
        let bestFood = null;
        let bestScore = -9999;

        for (const food of response.data.foods) {
          let score = 0;
          const descLower = food.description.toLowerCase();
          
          // Core Entity Enforcement
          const coreEntity = foodName.replace(/boiled|cooked|raw|fresh|fried|steamed|grilled|roasted/gi, '').trim().toLowerCase();
          if (coreEntity) {
            // Check if any word in the core entity exists in the description
            const coreWords = coreEntity.split(/\s+/);
            const hasCoreMatch = coreWords.some(word => descLower.includes(word));
            if (hasCoreMatch) {
              score += 500;
            } else {
              score -= 500; // Penalize if it doesn't even contain the main ingredient word
            }
          }

          if (descLower === searchQuery.toLowerCase() || descLower === foodName) score += 50;
          else if (descLower.includes(searchQuery.toLowerCase())) score += 20;

          const positiveMods = ['raw', 'fresh', 'cooked', 'boiled', 'steamed', 'grilled', 'roasted', 'fried', 'curry'];
          for (const mod of positiveMods) {
            if (foodName.includes(mod) && descLower.includes(mod)) score += 20;
          }

          if (foodName.includes('boiled') && (descLower.includes('raw') || descLower.includes('fried'))) score -= 50;
          if (foodName.includes('raw') && (descLower.includes('cooked') || descLower.includes('boiled'))) score -= 50;
          if (foodName.includes('fried') && (descLower.includes('raw') || descLower.includes('boiled'))) score -= 50;

          const negativeMods = ['powder', 'dehydrated', 'freeze dried', 'chips', 'snack', 'mix', 'supplement', 'protein', 'formula', 'extract', 'flour', 'beverage', 'drink'];
          for (const mod of negativeMods) {
            if (!foodName.includes(mod) && descLower.includes(mod)) {
              score -= 100;
            }
          }

          if (expectedCalsPer100g) {
            const calNut = food.foodNutrients.find((n: any) => n.nutrientId === 1008);
            if (calNut) {
              const diff = Math.abs(calNut.value - expectedCalsPer100g);
              if (diff > expectedCalsPer100g * 0.35) {
                score -= 200; // Heavily penalize impossible matches
              }
            }
          }

          if (score > bestScore) {
            bestScore = score;
            bestFood = food;
          }
        }

        if (bestFood && bestScore > -100) {
          let multiplier = quantity;
          let estimatedWeightGrams = quantity * (dictEntry?.defaultWeightGramsPerPiece || 100);

          if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'ml') {
             multiplier = quantity / 100;
             estimatedWeightGrams = quantity;
          } else {
            const portion = bestFood.foodPortions?.find((p: any) => p.gramWeight);
            if (portion && portion.gramWeight) {
              estimatedWeightGrams = quantity * portion.gramWeight;
              multiplier = estimatedWeightGrams / 100;
            } else {
              multiplier = estimatedWeightGrams / 100;
            }
          }

          const getNutrient = (id: number) => {
            const nut = bestFood.foodNutrients.find((n: any) => n.nutrientId === id);
            return nut ? nut.value * multiplier : 0;
          };

          detectedFoods.push({
            foodName: bestFood.description,
            quantity,
            unit,
            estimatedWeightGrams: Math.round(estimatedWeightGrams),
            calories: Math.round(getNutrient(1008)),
            protein: Math.round(getNutrient(1003)),
            carbs: Math.round(getNutrient(1005)),
            fat: Math.round(getNutrient(1004)),
            fiber: Math.round(getNutrient(1079)),
            confidence: 90,
            source: 'USDA Database (Smart Rank)'
          });
        }
      }
    } catch (err) {
      console.error('USDA search failed:', err);
    }
  }

  if (detectedFoods.length > 0) {
    console.log('[Parser] Success');
    return {
      detectedFoods,
      systemAnalysis: "SYSTEM ANALYSIS: Target acquired and mapped perfectly via internal parser. No AI processing required.",
      waterRecommendationMl: 0,
      totalCalories: detectedFoods.reduce((acc, f) => acc + f.calories, 0),
      totalProtein: detectedFoods.reduce((acc, f) => acc + f.protein, 0),
      totalCarbs: detectedFoods.reduce((acc, f) => acc + f.carbs, 0),
      totalFat: detectedFoods.reduce((acc, f) => acc + f.fat, 0)
    };
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
