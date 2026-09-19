import { UserProfile, CalculatedTargets } from '../types/profile';
import { ReferenceProfile } from '../types/assessment';

export function calculateUserTargets(profile: UserProfile): CalculatedTargets {
  const { weightKg, heightCm, age, sex, activityLevel, goal } = profile;

  // 1. Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') {
    bmr += 5;
  } else if (sex === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // neutral midpoint
  }

  // 2. Physical Activity Multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // 3. Goal Calorie Adjustment
  let targetCalories = tdee;
  let proteinRatio = 0.2; // 20%
  let fatRatio = 0.28; // 28%
  let carbRatio = 0.52; // 52%
  let targetSodium = 2300;
  let maxSugar = 50;

  switch (goal) {
    case 'fat_loss':
      targetCalories = Math.max(1200, Math.round(tdee - 450));
      proteinRatio = 0.28; // Higher protein for satiety & muscle preservation
      fatRatio = 0.27;
      carbRatio = 0.45;
      maxSugar = 35;
      break;

    case 'muscle_gain':
      targetCalories = Math.round(tdee + 350);
      proteinRatio = 0.25; // High protein (approx 1.8-2.0g/kg)
      fatRatio = 0.25;
      carbRatio = 0.5;
      break;

    case 'low_sodium':
      targetCalories = tdee;
      targetSodium = 1500; // Strict heart-healthy sodium target
      break;

    case 'low_sugar':
      targetCalories = tdee;
      maxSugar = 25; // 25g strict sugar limit
      break;

    case 'maintain':
    case 'healthy_eating':
    default:
      targetCalories = tdee;
      break;
  }

  // Calculate gram targets
  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  const targetProtein = Math.round((targetCalories * proteinRatio) / 4);
  const targetFat = Math.round((targetCalories * fatRatio) / 9);
  const targetCarbs = Math.round((targetCalories * carbRatio) / 4);
  const targetSaturatedFat = Math.round((targetCalories * 0.08) / 9); // <8% of calories
  const targetFiber = Math.max(25, Math.round((targetCalories / 1000) * 14)); // 14g per 1000 kcal standard
  const targetSalt = Number((targetSodium * 0.0025).toFixed(1));

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetSugars: maxSugar,
    targetFat,
    targetSaturatedFat,
    targetFiber,
    targetSodium,
    targetSalt,
  };
}

export function buildPersonalizedReferenceProfile(profile: UserProfile): ReferenceProfile {
  const targets = calculateUserTargets(profile);

  return {
    id: 'personalized',
    name: `Personalized (${profile.name || 'Your Profile'})`,
    regionOrAuthority: `Goal: ${profile.goal.replace('_', ' ').toUpperCase()}`,
    description: `Custom targets calibrated to ${profile.age}y, ${profile.weightKg}kg, and your ${profile.goal.replace('_', ' ')} goal.`,
    calories: targets.targetCalories,
    protein: targets.targetProtein,
    carbohydrates: targets.targetCarbs,
    sugars: targets.targetSugars,
    addedSugars: Math.round(targets.targetSugars * 0.6),
    fat: targets.targetFat,
    saturatedFat: targets.targetSaturatedFat,
    fiber: targets.targetFiber,
    sodium: targets.targetSodium,
    salt: targets.targetSalt,
  };
}
