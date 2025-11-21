export interface MacroNutrient {
  name: string;
  amount: number; // in grams
  unit: string;
  percentageOfDaily?: number; // Estimated %
}

export interface MicroNutrient {
  name: string;
  level: number; // 0 to 100 (representing density/amount relative to daily need)
  unit: string; // e.g., 'mg', 'ug', or 'IU'
}

export interface FoodAnalysisResult {
  foodName: string;
  description: string;
  estimatedWeight: string; // e.g., "250g"
  calories: number;
  macros: {
    protein: MacroNutrient;
    carbs: MacroNutrient;
    fat: MacroNutrient;
  };
  vitamins: MicroNutrient[];
  healthScore: number; // 1-10
}

export interface LmStudioConfig {
  baseUrl: string;
  model: string;
}