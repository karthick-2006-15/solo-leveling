import { nutritionRepository } from '../repositories/nutritionRepository';
import { userRepository } from '../repositories/userRepository';
import { awardXP, hasAwardedToday } from '../services/progressionService';
import FoodCache from '../models/FoodCache';
import { AppError } from '../utils/AppError';

export const nutritionService = {
  searchFoodDatabase: async (query: string) => {
    if (!query) return [];

    const normalizedQuery = query.toLowerCase().trim();

    // 1. Check local cache first via regex/text search
    const cached = await FoodCache.find(
      { $text: { $search: normalizedQuery } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(5);

    if (cached.length > 0) {
      return cached;
    }

    // 2. Fetch from USDA FoodData Central if missing
    try {
      // Fetch more results to allow for better filtering and ranking
      const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(normalizedQuery)}&api_key=${apiKey}&pageSize=20`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.foods || data.foods.length === 0) {
        return [];
      }

      // Rank results
      const rankedFoods = data.foods.sort((a: any, b: any) => {
        const aDesc = (a.description || '').toLowerCase();
        const bDesc = (b.description || '').toLowerCase();
        
        // 1. Data Type Priority (Most Important)
        const getDataTypeScore = (type: string) => {
          if (type === 'Foundation') return 4;
          if (type === 'SR Legacy') return 3;
          if (type === 'Survey (FNDDS)') return 2;
          if (type === 'Branded') return 0; // Penalize branded heavily
          return 1;
        };
        const aScore = getDataTypeScore(a.dataType);
        const bScore = getDataTypeScore(b.dataType);
        
        if (aScore !== bScore) {
          return bScore - aScore;
        }

        // 2. Exact Match (Within the same data type)
        const aExact = aDesc === normalizedQuery;
        const bExact = bDesc === normalizedQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // 3. Whole Word Match Bonus
        const regex = new RegExp(`\\b${normalizedQuery}\\b`, 'i');
        const aWhole = regex.test(aDesc);
        const bWhole = regex.test(bDesc);
        if (aWhole && !bWhole) return -1;
        if (!aWhole && bWhole) return 1;

        // 4. "Whole" / "Raw" bonus for generic ingredients
        const isGenericRaw = (desc: string) => /(whole|raw|generic|plain)\b/.test(desc);
        const aGeneric = isGenericRaw(aDesc);
        const bGeneric = isGenericRaw(bDesc);
        if (aGeneric && !bGeneric) return -1;
        if (!aGeneric && bGeneric) return 1;

        // 5. Keyword Match in first position
        const aStartsWith = aDesc.startsWith(normalizedQuery);
        const bStartsWith = bDesc.startsWith(normalizedQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // 6. Fewer words (Simpler descriptions are usually closer to generic raw ingredients)
        const aWords = aDesc.split(/[\s,]+/).length;
        const bWords = bDesc.split(/[\s,]+/).length;
        if (aWords !== bWords) {
          return aWords - bWords;
        }

        return aDesc.length - bDesc.length;
      });

      // Deduplicate by lowercased description
      const seenDescriptions = new Set<string>();
      const uniqueFoods = [];

      for (const prod of rankedFoods) {
        const desc = (prod.description || query).toLowerCase();
        if (seenDescriptions.has(desc)) continue;
        seenDescriptions.add(desc);
        uniqueFoods.push(prod);
        
        if (uniqueFoods.length >= 5) break; // Keep top 5 unique
      }

      const results = [];
      for (const prod of uniqueFoods) {
        const getNutrient = (id: number) => prod.foodNutrients?.find((n: any) => n.nutrientId === id)?.value || 0;
        
        // USDA returns values per 100g by default in standard queries
        const newCache = new FoodCache({
          foodName: prod.description || query,
          thumbnail: '',
          dataType: prod.dataType || 'USDA',
          baseQuantity: 100,
          baseUnit: 'g',
          nutrients: {
            calories: getNutrient(1008),
            protein: getNutrient(1003),
            carbs: getNutrient(1005),
            fat: getNutrient(1004),
            fiber: getNutrient(1079),
            sugar: getNutrient(2000),
            sodium: getNutrient(1093),
            calcium: getNutrient(1087),
            iron: getNutrient(1089),
          },
          source: 'usda',
          rawApiResponse: prod,
        });

        await newCache.save();
        results.push(newCache);
      }
      return results;
    } catch (error) {
      console.error('Error fetching from USDA API:', error);
      return []; // graceful fallback
    }
  },

  parseFoodMock: (query: string) => {
    return [{
      food_name: query,
      serving_qty: 1,
      serving_unit: 'serving',
      nf_calories: 150,
      nf_protein: 5,
      nf_total_carbohydrate: 20,
      nf_total_fat: 5
    }];
  },

  checkGoalsAndAwardXP: async (userId: string, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const logs = await nutritionRepository.findFoodLogsByDateRange(userId, startOfDay, endOfDay);
    
    let totalCalories = 0;
    let totalProtein = 0;
    logs.forEach(log => {
      totalCalories += log.nutrients.calories;
      totalProtein += log.nutrients.protein;
    });

    const user = await userRepository.findById(userId);
    const calorieGoal = user?.dailyCalorieGoal || 2000;
    const proteinGoal = user?.dailyProteinGoal || 100;

    const xpResults = [];

    if (totalCalories >= calorieGoal) {
      const alreadyAwarded = await hasAwardedToday(userId, 'calorie_goal_met');
      if (!alreadyAwarded) {
        const result = await awardXP(userId, 'calorie_goal_met', 50);
        xpResults.push({ source: 'calorie_goal_met', result });
      }
    }

    if (totalProtein >= proteinGoal) {
      const alreadyAwarded = await hasAwardedToday(userId, 'protein_goal_met');
      if (!alreadyAwarded) {
        const result = await awardXP(userId, 'protein_goal_met', 50);
        xpResults.push({ source: 'protein_goal_met', result });
      }
    }

    return xpResults;
  },

  logFood: async (userId: string, data: any) => {
    const { mealType, date, rawDescription, servingDescription, nutrients, source } = data;
    const logDate = date ? new Date(date) : new Date();

    const log = await nutritionRepository.createFoodLog({
      userId: userId as any,
      mealType,
      date: logDate,
      rawDescription,
      servingDescription,
      nutrients,
      source: source || 'nutritionix'
    });

    const xpResults = await nutritionService.checkGoalsAndAwardXP(userId, logDate);
    return { log, xpResults };
  },

  logManualFood: async (userId: string, data: any) => {
    const { mealType, date, name, calories, protein, carbs, fat } = data;
    const logDate = date ? new Date(date) : new Date();

    const log = await nutritionRepository.createFoodLog({
      userId: userId as any,
      mealType,
      date: logDate,
      rawDescription: name,
      servingDescription: '1 serving',
      nutrients: { calories, protein, carbs, fat },
      source: 'manual'
    });

    const xpResults = await nutritionService.checkGoalsAndAwardXP(userId, logDate);
    return { log, xpResults };
  },

  getFoodLogs: async (userId: string, dateStr: string) => {
    const logDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(logDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(logDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return nutritionRepository.findFoodLogsByDateRange(userId, startOfDay, endOfDay);
  },

  deleteFoodLog: async (id: string, userId: string) => {
    const log = await nutritionRepository.deleteFoodLog(id, userId);
    if (!log) throw new AppError('Log not found', 404);
    return log;
  },

  getNutritionSummary: async (userId: string, range: any) => {
    const days = range === 'month' ? 30 : 7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setUTCHours(0,0,0,0);

    const logs = await nutritionRepository.findFoodLogsFromDate(userId, cutoff);
    const dailyMap: Record<string, any> = {};

    logs.forEach(log => {
      const dateStr = log.date.toISOString().split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { calories: 0, protein: 0, carbs: 0, fat: 0, date: dateStr };
      }
      dailyMap[dateStr].calories += log.nutrients.calories;
      dailyMap[dateStr].protein += log.nutrients.protein;
      dailyMap[dateStr].carbs += log.nutrients.carbs;
      dailyMap[dateStr].fat += log.nutrients.fat;
    });

    return Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
  },

  logWater: async (userId: string, amountMl: number) => {
    const date = new Date();
    await nutritionRepository.createWaterLog({ userId: userId as any, amountMl, date });

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const logs = await nutritionRepository.findWaterLogsByDateRange(userId, startOfDay, endOfDay);
    const totalWaterMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

    const user = await userRepository.findById(userId);
    const targetMl = (user?.dailyWaterGoalLiters || 2.5) * 1000;

    let xpResult = null;
    if (totalWaterMl >= targetMl) {
      const alreadyAwarded = await hasAwardedToday(userId, 'water_goal_met');
      if (!alreadyAwarded) {
        xpResult = await awardXP(userId, 'water_goal_met', 20);
      }
    }

    return { totalWaterMl, xpResult };
  },

  getWater: async (userId: string, dateStr: string) => {
    const logDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(logDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(logDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const logs = await nutritionRepository.findWaterLogsByDateRange(userId, startOfDay, endOfDay);
    return logs.reduce((sum, log) => sum + log.amountMl, 0);
  }
};
