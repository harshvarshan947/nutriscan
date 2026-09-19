import { ReferenceStandardId } from './assessment';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';

export type DietaryGoal =
  | 'maintain'
  | 'fat_loss'
  | 'muscle_gain'
  | 'healthy_eating'
  | 'low_sodium'
  | 'low_sugar';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: 'female' | 'male' | 'prefer_not_to_say';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: DietaryGoal;
  referenceStandard: ReferenceStandardId;
  geminiApiKey?: string;
  useAiSummary: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkMode: boolean;
  updatedAt: number;
}

export interface CalculatedTargets {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number;
  targetProtein: number; // g
  targetCarbs: number; // g
  targetSugars: number; // g
  targetFat: number; // g
  targetSaturatedFat: number; // g
  targetFiber: number; // g
  targetSodium: number; // mg
  targetSalt: number; // g
}
