import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

let aiClient: GoogleGenAI;
const getAi = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
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

// AI is now strictly an Entity Extractor, NEVER a macro calculator
const SYSTEM_PROMPT = `
You are the "System" - an advanced AI Hunter System.
The user will input what they ate (e.g., "I had 2 idlis and a packet of lays").
Your ONLY job is to identify the individual food items, normalize their names, and extract quantities.
DO NOT calculate calories or macros. You are strictly a parsing engine.

Your response MUST be a STRICT JSON object:
{
  "detectedFoods": [
    {
      "foodName": "String (Normalized clean search query, e.g., 'Idli', 'Lays Magic Masala Chips', 'Cooked White Rice', 'Fresh Mango')",
      "quantity": 1,
      "unit": "String (e.g., 'piece', 'g', 'ml', 'cup', 'packet')"
    }
  ]
}
Do NOT output markdown blocks.
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
  "paneer butter masala": { isHardcoded: true, search: "Paneer Butter Masala", macrosPer100g: { cals: 250, prot: 8, fat: 20, carb: 10, fiber: 2 }, defaultWeightGramsPerPiece: 200 },
  
  // IFCT / NIN Additions
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
  "fish curry": { isHardcoded: true, search: "Fish Curry", macrosPer100g: { cals: 110, prot: 10, fat: 6, carb: 4, fiber: 0.5 }, defaultWeightGramsPerPiece: 200 },
  "egg curry": { isHardcoded: true, search: "Egg Curry", macrosPer100g: { cals: 120, prot: 8, fat: 9, carb: 4, fiber: 1 }, defaultWeightGramsPerPiece: 200 },
  "pongal": { isHardcoded: true, search: "Pongal", macrosPer100g: { cals: 150, prot: 4, fat: 6, carb: 20, fiber: 1.5 }, defaultWeightGramsPerPiece: 200 },
  "lemon rice": { isHardcoded: true, search: "Lemon Rice", macrosPer100g: { cals: 160, prot: 3, fat: 6, carb: 24, fiber: 1 }, defaultWeightGramsPerPiece: 200 },
  "curd rice": { isHardcoded: true, search: "Curd Rice", macrosPer100g: { cals: 110, prot: 3, fat: 4, carb: 15, fiber: 1 }, defaultWeightGramsPerPiece: 200 },
  "tamarind rice": { isHardcoded: true, search: "Tamarind Rice", macrosPer100g: { cals: 170, prot: 3, fat: 7, carb: 25, fiber: 1 }, defaultWeightGramsPerPiece: 200 },
  "parotta": { isHardcoded: true, search: "Parotta", macrosPerPiece: { cals: 260, prot: 5, fat: 10, carb: 35, fiber: 1 }, defaultWeightGramsPerPiece: 80 },
  "poori": { isHardcoded: true, search: "Poori", macrosPerPiece: { cals: 140, prot: 2, fat: 8, carb: 15, fiber: 1 }, defaultWeightGramsPerPiece: 40 },
  "appam": { isHardcoded: true, search: "Appam", macrosPerPiece: { cals: 120, prot: 2, fat: 3, carb: 22, fiber: 1 }, defaultWeightGramsPerPiece: 60 },
  "puttu": { isHardcoded: true, search: "Puttu", macrosPer100g: { cals: 170, prot: 3, fat: 2, carb: 35, fiber: 2 }, defaultWeightGramsPerPiece: 150 },
  "idiyappam": { isHardcoded: true, search: "Idiyappam", macrosPerPiece: { cals: 60, prot: 1, fat: 0.5, carb: 13, fiber: 1 }, defaultWeightGramsPerPiece: 40 }
};

const COMMON_UNITS = ['g', 'ml', 'cup', 'cups', 'piece', 'pieces', 'slice', 'slices', 'bowl', 'plate', 'kg', 'tbsp', 'tsp', 'packet'];

function getMultiplier(quantity: number, unit: string, defaultWeightGrams: number): { estWeight: number, multiplier100g: number, multiplierPiece: number } {
  let estWeight = quantity * defaultWeightGrams;
  let m100 = estWeight / 100;
  let mPiece = quantity;

  if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'ml') {
    estWeight = quantity;
    m100 = quantity / 100;
    mPiece = quantity / defaultWeightGrams;
  } else if (unit.toLowerCase() === 'kg' || unit.toLowerCase() === 'l' || unit.toLowerCase() === 'liter') {
    estWeight = quantity * 1000;
    m100 = estWeight / 100;
    mPiece = estWeight / defaultWeightGrams;
  }
  
  return { estWeight, multiplier100g: m100, multiplierPiece: mPiece };
}

async function searchUSDA(query: string, quantity: number, unit: string, expectedCalsPer100g?: number | null, defaultWeight?: number): Promise<AnalyzedFood | null> {
  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=20`;
    const response = await axios.get(url);

    if (response.data && response.data.foods && response.data.foods.length > 0) {
      let bestFood = null;
      let bestScore = -9999;

      for (const food of response.data.foods) {
        let score = 0;
        const descLower = food.description.toLowerCase();
        
        const coreEntity = query.replace(/boiled|cooked|raw|fresh|fried|steamed|grilled|roasted/gi, '').trim().toLowerCase();
        if (coreEntity) {
          const coreWords = coreEntity.split(/\s+/);
          const hasCoreMatch = coreWords.some(word => descLower.includes(word));
          if (hasCoreMatch) score += 500;
          else score -= 500;
        }

        if (descLower === query.toLowerCase()) score += 50;
        else if (descLower.includes(query.toLowerCase())) score += 20;

        const positiveMods = ['raw', 'fresh', 'cooked', 'boiled', 'steamed', 'grilled', 'roasted', 'fried', 'curry'];
        for (const mod of positiveMods) {
          if (query.includes(mod) && descLower.includes(mod)) score += 20;
        }

        if (query.includes('boiled') && (descLower.includes('raw') || descLower.includes('fried'))) score -= 50;
        if (query.includes('raw') && (descLower.includes('cooked') || descLower.includes('boiled'))) score -= 50;
        if (query.includes('fried') && (descLower.includes('raw') || descLower.includes('boiled'))) score -= 50;

        const negativeMods = ['powder', 'dehydrated', 'freeze dried', 'chips', 'snack', 'mix', 'supplement', 'protein', 'formula', 'extract', 'flour', 'beverage', 'drink'];
        for (const mod of negativeMods) {
          if (!query.includes(mod) && descLower.includes(mod)) score -= 100;
        }

        if (expectedCalsPer100g) {
          const calNut = food.foodNutrients.find((n: any) => n.nutrientId === 1008);
          if (calNut) {
            const diff = Math.abs(calNut.value - expectedCalsPer100g);
            if (diff > expectedCalsPer100g * 0.35) score -= 200; 
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestFood = food;
        }
      }

      if (bestFood && bestScore > -100) {
        const { estWeight, multiplier100g } = getMultiplier(quantity, unit, defaultWeight || 100);
        let multiplier = multiplier100g;
        let finalWeight = estWeight;

        if (unit.toLowerCase() !== 'g' && unit.toLowerCase() !== 'ml') {
          const portion = bestFood.foodPortions?.find((p: any) => p.gramWeight);
          if (portion && portion.gramWeight) {
            finalWeight = quantity * portion.gramWeight;
            multiplier = finalWeight / 100;
          }
        }

        const getNutrient = (id: number) => {
          const nut = bestFood.foodNutrients.find((n: any) => n.nutrientId === id);
          return nut ? nut.value * multiplier : 0;
        };

        return {
          foodName: bestFood.description,
          quantity,
          unit,
          estimatedWeightGrams: Math.round(finalWeight),
          calories: Math.round(getNutrient(1008)),
          protein: Math.round(getNutrient(1003)),
          carbs: Math.round(getNutrient(1005)),
          fat: Math.round(getNutrient(1004)),
          fiber: Math.round(getNutrient(1079)),
          confidence: 90,
          source: 'USDA Database'
        };
      }
    }
  } catch (err) {
    console.error('USDA search failed:', err);
  }
  return null;
}

async function searchOpenFoodFacts(query: string, quantity: number, unit: string): Promise<AnalyzedFood | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=3`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SoloLevelingApp - Web - Version 1.0 - www.sololeveling.app'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.products && response.data.products.length > 0) {
      const product = response.data.products[0];
      const nutriments = product.nutriments || {};
      
      const cals100g = nutriments['energy-kcal_100g'] || 0;
      if (cals100g === 0) return null;

      const prot100g = nutriments['proteins_100g'] || 0;
      const carb100g = nutriments['carbohydrates_100g'] || 0;
      const fat100g = nutriments['fat_100g'] || 0;
      const fiber100g = nutriments['fiber_100g'] || 0;

      const defaultWeight = product.product_quantity ? parseFloat(product.product_quantity) : 100;
      const { estWeight, multiplier100g } = getMultiplier(quantity, unit, defaultWeight);

      return {
         foodName: product.product_name || query,
         quantity,
         unit,
         estimatedWeightGrams: Math.round(estWeight),
         calories: Math.round(cals100g * multiplier100g),
         protein: Math.round(prot100g * multiplier100g),
         carbs: Math.round(carb100g * multiplier100g),
         fat: Math.round(fat100g * multiplier100g),
         fiber: Math.round(fiber100g * multiplier100g),
         confidence: 85,
         source: 'OpenFoodFacts'
      };
    }
  } catch (err) {
    console.error('OFF search failed', err);
  }
  return null;
}

// Unified Database Resolver
async function resolveFoodDatabase(rawName: string, quantity: number, unit: string): Promise<AnalyzedFood | null> {
  const foodName = rawName.trim().toLowerCase();
  const singularName = foodName.endsWith('s') && !foodName.endsWith('ss') ? foodName.slice(0, -1) : foodName;
  const dictEntry = LOCAL_FOOD_DICT[foodName] || LOCAL_FOOD_DICT[singularName];

  // 1. IFCT / NIN Local Dictionary
  if (dictEntry && dictEntry.isHardcoded) {
    const { estWeight, multiplier100g, multiplierPiece } = getMultiplier(quantity, unit, dictEntry.defaultWeightGramsPerPiece || 100);
    const macros = dictEntry.macrosPerPiece || dictEntry.macrosPer100g || { cals: 0, prot: 0, fat: 0, carb: 0, fiber: 0 };
    const multiplier = dictEntry.macrosPerPiece ? multiplierPiece : multiplier100g;

    return {
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
      source: 'IFCT / NIN Database'
    };
  }

  const searchQuery = dictEntry ? dictEntry.search : foodName;

  // 2. USDA FDC
  const usdaResult = await searchUSDA(searchQuery, quantity, unit, dictEntry?.expectedCalsPer100g, dictEntry?.defaultWeightGramsPerPiece);
  if (usdaResult) return usdaResult;

  // 3. OpenFoodFacts
  const offResult = await searchOpenFoodFacts(foodName, quantity, unit);
  if (offResult) return offResult;

  return null;
}

async function callGroqEntities(prompt: string): Promise<any> {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-70b-8192',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    },
    { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 10000 }
  );
  return JSON.parse(response.data.choices[0].message.content);
}

async function callOpenRouterEntities(prompt: string): Promise<any> {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'meta-llama/llama-3-70b-instruct',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    },
    { headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://sololeveling.app' }, timeout: 15000 }
  );
  return JSON.parse(response.data.choices[0].message.content);
}

async function callGeminiEntities(prompt: string): Promise<any> {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${SYSTEM_PROMPT}\n\nUSER INPUT:\n${prompt}`,
        config: { responseMimeType: 'application/json' }
    });
    const textResponse = response.text || '{}';
    const jsonStr = textResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(jsonStr);
}

async function callAIForEntities(prompt: string): Promise<{ detectedFoods: { foodName: string, quantity: number, unit: string }[] }> {
    try {
      if (process.env.GROQ_API_KEY) return await callGroqEntities(prompt);
      throw new Error('No Groq');
    } catch (_e) {
      try {
        if (process.env.OPENROUTER_API_KEY) return await callOpenRouterEntities(prompt);
        throw new Error('No OpenRouter', { cause: _e });
      } catch (_e2) {
        return await callGeminiEntities(prompt);
      }
    }
}

function getGracefulFallback(): NutritionAnalysisResult {
  return {
    detectedFoods: [],
    systemAnalysis: "Hunter System temporarily unavailable. Validation failed.",
    waterRecommendationMl: 0,
    totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
  };
}

export const analyzeFoodInput = async (text: string): Promise<NutritionAnalysisResult> => {
  let entities: { foodName: string, quantity: number, unit: string }[] = [];

  // Try parsing manually first (Fast path)
  if (text.length < 100) {
    const chunks = text.split(/\b(?:and|with|&|,)\b/i).map(c => c.trim()).filter(Boolean);
    const manualEntities = [];
    let parsedSuccessfully = true;
    for (const chunk of chunks) {
      const match = chunk.match(SIMPLE_FOOD_REGEX);
      if (match) {
        const qty = parseFloat(match[1]);
        const potentialUnit = match[2];
        const rest = match[3];
        let unit = 'piece';
        let name;
        if (potentialUnit && COMMON_UNITS.includes(potentialUnit.toLowerCase())) {
          unit = potentialUnit; name = rest;
        } else {
          name = potentialUnit ? `${potentialUnit} ${rest}` : rest;
        }
        manualEntities.push({ foodName: name, quantity: qty, unit });
      } else {
        parsedSuccessfully = false;
        break;
      }
    }
    if (parsedSuccessfully && manualEntities.length > 0) {
       entities = manualEntities;
    }
  }

  // If manual parse failed or it's a long sentence, let AI parse the entities
  if (entities.length === 0 || text.length >= 100) {
     try {
       console.log('[AI] Extracting entities...');
       const aiResponse = await callAIForEntities(text);
       entities = aiResponse.detectedFoods || [];
     } catch (err) {
       console.error('[AI] Parsing failed.', err);
       return getGracefulFallback();
     }
  }

  // Resolve through Database Waterfall
  const resolvedFoods: AnalyzedFood[] = [];
  for (const entity of entities) {
    const result = await resolveFoodDatabase(entity.foodName, entity.quantity, entity.unit);
    if (result) {
       resolvedFoods.push(result);
    } else {
       // Failed to match any database
       resolvedFoods.push({
          foodName: entity.foodName,
          quantity: entity.quantity,
          unit: entity.unit,
          estimatedWeightGrams: 0,
          calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
          confidence: 0,
          source: 'Not Found',
          alternatives: ['Try being more specific']
       });
    }
  }

  return {
      detectedFoods: resolvedFoods,
      systemAnalysis: "SYSTEM ANALYSIS: Target scanned across IFCT, USDA, and OpenFoodFacts databases.",
      waterRecommendationMl: 0,
      totalCalories: resolvedFoods.reduce((acc, f) => acc + f.calories, 0),
      totalProtein: resolvedFoods.reduce((acc, f) => acc + f.protein, 0),
      totalCarbs: resolvedFoods.reduce((acc, f) => acc + f.carbs, 0),
      totalFat: resolvedFoods.reduce((acc, f) => acc + f.fat, 0)
  };
};
