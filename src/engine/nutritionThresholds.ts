import { ReferenceProfile, ReferenceStandardId } from '../types/assessment';

export const REFERENCE_STANDARDS: Record<ReferenceStandardId, ReferenceProfile> = {
  general_adult: {
    id: 'general_adult',
    name: 'General Adult Reference',
    regionOrAuthority: 'International Baseline',
    description: 'Standard dietary reference values for average adults based on a 2,000 kcal diet.',
    calories: 2000,
    protein: 50, // 50g
    carbohydrates: 275, // 275g (55% energy)
    sugars: 50, // 50g max recommended
    addedSugars: 25, // 25g (WHO recommendation)
    fat: 70, // 70g (approx 30% energy)
    saturatedFat: 20, // 20g (max 10% energy)
    fiber: 28, // 28g daily goal
    sodium: 2300, // 2300mg max
    salt: 6, // 6g max
  },
  fda_dv: {
    id: 'fda_dv',
    name: 'US FDA Daily Values (DV)',
    regionOrAuthority: 'United States FDA',
    description: 'Official US Food and Drug Administration Daily Values updated for nutrition labeling.',
    calories: 2000,
    protein: 50,
    carbohydrates: 275,
    sugars: 50,
    addedSugars: 50,
    fat: 78,
    saturatedFat: 20,
    fiber: 28,
    sodium: 2300,
    salt: 5.75,
  },
  uk_traffic_light: {
    id: 'uk_traffic_light',
    name: 'UK Department of Health (Traffic Light)',
    regionOrAuthority: 'United Kingdom NHS / FSA',
    description: 'Front-of-pack traffic light labeling thresholds for Low/Medium/High cutoffs per 100g.',
    calories: 2000,
    protein: 50,
    carbohydrates: 260,
    sugars: 90,
    addedSugars: 30,
    fat: 70,
    saturatedFat: 20,
    fiber: 30,
    sodium: 2400,
    salt: 6,
  },
  who_guidelines: {
    id: 'who_guidelines',
    name: 'WHO Healthy Diet Recommendations',
    regionOrAuthority: 'World Health Organization',
    description: 'Global guidelines highlighting restricted free sugars (<5% energy), reduced saturated fats (<10%), and <2g sodium.',
    calories: 2000,
    protein: 60,
    carbohydrates: 275,
    sugars: 25, // strict WHO <5% sugar guideline
    addedSugars: 25,
    fat: 65,
    saturatedFat: 18,
    fiber: 30,
    sodium: 2000,
    salt: 5,
  },
  personalized: {
    id: 'personalized',
    name: 'Personalized Profile Targets',
    regionOrAuthority: 'Custom User Goals',
    description: 'Calculated dynamically based on your age, body metrics, activity level, and dietary objectives.',
    calories: 2000,
    protein: 75,
    carbohydrates: 250,
    sugars: 45,
    addedSugars: 25,
    fat: 65,
    saturatedFat: 18,
    fiber: 30,
    sodium: 2300,
    salt: 5.8,
  },
};

/**
 * Standard thresholds per 100g of food based on UK Department of Health / EU regulations
 */
export const PER_100G_THRESHOLDS = {
  sugars: {
    low: 5.0, // <= 5g is Low (Green)
    high: 22.5, // > 22.5g is High (Red)
  },
  fat: {
    low: 3.0, // <= 3.0g is Low (Green)
    high: 17.5, // > 17.5g is High (Red)
  },
  saturatedFat: {
    low: 1.5, // <= 1.5g is Low (Green)
    high: 5.0, // > 5.0g is High (Red)
  },
  salt: {
    low: 0.3, // <= 0.3g is Low (Green)
    high: 1.5, // > 1.5g is High (Red)
  },
  sodium: {
    low: 120, // <= 120mg is Low (Green)
    high: 600, // > 600mg is High (Red)
  },
  fiber: {
    good: 3.0, // >= 3g is Source of Fiber
    high: 6.0, // >= 6g is High in Fiber (Favorable)
  },
  protein: {
    good: 5.0, // >= 5g is Source of Protein
    high: 10.0, // >= 10g is High Protein (Favorable)
  },
};
