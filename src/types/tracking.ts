export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealLogEntry {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  timestamp: number;
  mealType: MealType;
  barcode: string;
  productName: string;
  brand: string;
  image?: string;
  servingsCount: number; // e.g. 1.0, 0.5, 2.0
  servingLabel: string; // e.g. "1 serving (45g)" or "100g"
  calories: number;
  protein: number;
  carbohydrates: number;
  sugars: number;
  fat: number;
  saturatedFat: number;
  fiber: number;
  sodium: number;
  salt: number;
}

export interface FavoriteProduct {
  barcode: string;
  name: string;
  brand: string;
  image?: string;
  qualityScore: number;
  qualityTier: 'Excellent' | 'Good' | 'Moderate' | 'Low';
  addedAt: number;
}

export interface ScannedHistoryItem {
  id?: number;
  barcode: string;
  name: string;
  brand: string;
  image?: string;
  qualityScore: number;
  qualityTier: 'Excellent' | 'Good' | 'Moderate' | 'Low';
  scannedAt: number;
}
