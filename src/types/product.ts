export interface ProductNutrients {
  calories: number; // kcal
  protein: number; // g
  carbohydrates: number; // g
  sugars: number; // g
  addedSugars?: number; // g
  fat: number; // g
  saturatedFat: number; // g
  fiber: number; // g
  sodium: number; // mg
  salt: number; // g
}

export interface FoodAdditive {
  id: string; // e.g. "e330", "e250"
  name: string; // e.g. "Citric acid", "Sodium nitrite"
  riskLevel?: 'safe' | 'caution' | 'high_risk' | 'unknown';
  function?: string; // e.g. "Preservative", "Emulsifier", "Color"
  description?: string;
}

export interface ProductDetails {
  barcode: string;
  name: string;
  brand: string;
  image?: string;
  thumbnail?: string;
  servingSize?: string;
  servingQuantityGrams?: number;
  nutrients100g: ProductNutrients;
  nutrientsServing?: ProductNutrients;
  ingredientsText?: string;
  ingredientsList?: string[];
  allergens: string[];
  additives: FoodAdditive[];
  novaGroup?: 1 | 2 | 3 | 4; // 1: Unprocessed, 2: Culinary, 3: Processed, 4: Ultra-processed
  nutriScore?: 'a' | 'b' | 'c' | 'd' | 'e';
  ecoScore?: 'a' | 'b' | 'c' | 'd' | 'e';
  categories?: string[];
  labels?: string[];
  source: 'openfoodfacts' | 'cache' | 'sample' | 'manual';
  isComplete: boolean;
  missingFields: string[];
  isEstimated?: boolean;
  estimatedCategory?: string;
  lastUpdated: number;
}
