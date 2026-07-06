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
