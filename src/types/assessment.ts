import { ProductNutrients } from './product';

export type AssessmentLevel = 'low' | 'moderate' | 'high' | 'very_high';
export type AssessmentStatus = 'favorable' | 'neutral' | 'caution' | 'warning';
export type QualityTier = 'Excellent' | 'Good' | 'Moderate' | 'Low';

export type ReferenceStandardId =
  | 'general_adult'
  | 'fda_dv'
  | 'uk_traffic_light'
  | 'who_guidelines'
  | 'personalized';

export interface ReferenceProfile {
  id: ReferenceStandardId;
  name: string;
  regionOrAuthority: string;
  description: string;
  calories: number; // kcal
  protein: number; // g
  carbohydrates: number; // g
  sugars: number; // g
  addedSugars: number; // g
  fat: number; // g
  saturatedFat: number; // g
  fiber: number; // g
  sodium: number; // mg
  salt: number; // g
}

export interface NutrientRating {
  nutrient: keyof ProductNutrients;
  label: string;
  valuePer100g: number;
  valuePerServing?: number;
  unit: string;
  referenceDailyValue: number;
  percentDailyValue: number; // based on reference per serving/100g
  level: AssessmentLevel;
  status: AssessmentStatus;
  advice: string;
  trafficLightColor: 'green' | 'amber' | 'red';
}

export interface AssessmentFactor {
  id: string;
  type: 'positive' | 'caution' | 'warning';
  icon: 'check' | 'alert-triangle' | 'alert-circle' | 'info' | 'zap' | 'heart';
  title: string;
  description: string;
  metric?: string;
}

export interface HealthAssessmentResult {
  qualityScore: number; // 0 to 100
  qualityTier: QualityTier;
  summaryHeadline: string;
  ratings: Record<keyof ProductNutrients, NutrientRating>;
  positiveFactors: AssessmentFactor[];
  cautionFactors: AssessmentFactor[];
  referenceProfile: ReferenceProfile;
  novaInsight?: {
    group: 1 | 2 | 3 | 4;
    title: string;
    explanation: string;
  };
  disclaimer: string;
  generatedAt: number;
}
