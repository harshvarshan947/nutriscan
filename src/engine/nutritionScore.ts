import { ProductNutrients } from '../types/product';
import { AssessmentLevel, AssessmentStatus, NutrientRating, ReferenceProfile } from '../types/assessment';
import { PER_100G_THRESHOLDS } from './nutritionThresholds';

export function evaluateNutrient(
  nutrient: keyof ProductNutrients,
  val100g: number,
  valServing: number | undefined,
  refProfile: ReferenceProfile
): NutrientRating {
  const refDaily = refProfile[nutrient] || 1;
  const compareVal = valServing !== undefined ? valServing : val100g;
  const percentDV = Math.round((compareVal / refDaily) * 100);

  let level: AssessmentLevel = 'moderate';
  let status: AssessmentStatus = 'neutral';
  let trafficLightColor: 'green' | 'amber' | 'red' = 'amber';
  let label = '';
  let unit = 'g';
  let advice = '';

  switch (nutrient) {
    case 'calories':
      label = 'Energy / Calories';
      unit = 'kcal';
      if (val100g < 100) {
        level = 'low';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Low calorie density.';
      } else if (val100g < 250) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate calorie density.';
      } else if (val100g < 450) {
        level = 'high';
        status = 'caution';
        trafficLightColor = 'amber';
        advice = 'Moderately high energy density.';
      } else {
        level = 'very_high';
        status = 'warning';
        trafficLightColor = 'red';
        advice = 'Very energy-dense; check portion size.';
      }
      break;

    case 'sugars':
      label = 'Total Sugars';
      unit = 'g';
      if (val100g <= PER_100G_THRESHOLDS.sugars.low) {
        level = 'low';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Low sugar content.';
      } else if (val100g <= 12.5) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate sugar content.';
      } else if (val100g <= PER_100G_THRESHOLDS.sugars.high) {
        level = 'high';
        status = 'caution';
        trafficLightColor = 'amber';
        advice = 'Approaching high sugar limits.';
      } else {
        level = 'very_high';
        status = 'warning';
        trafficLightColor = 'red';
        advice = 'High sugar content per 100g.';
      }
      break;

    case 'addedSugars':
      label = 'Added Sugars';
      unit = 'g';
      if (val100g <= 2.5) {
        level = 'low';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Minimal added sugars.';
      } else if (val100g <= 10) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'amber';
        advice = 'Moderate added sugars.';
      } else {
        level = 'high';
        status = 'warning';
        trafficLightColor = 'red';
        advice = 'Significant added sugars.';
      }
      break;

    case 'saturatedFat':
      label = 'Saturated Fat';
      unit = 'g';
      if (val100g <= PER_100G_THRESHOLDS.saturatedFat.low) {
        level = 'low';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Low saturated fat.';
      } else if (val100g <= 3.5) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate saturated fat.';
      } else if (val100g <= PER_100G_THRESHOLDS.saturatedFat.high) {
        level = 'high';
        status = 'caution';
        trafficLightColor = 'amber';
        advice = 'Higher saturated fat content.';
      } else {
        level = 'very_high';
        status = 'warning';
        trafficLightColor = 'red';
        advice = 'High saturated fat; consume in moderation.';
      }
      break;

    case 'fat':
      label = 'Total Fat';
      unit = 'g';
      if (val100g <= PER_100G_THRESHOLDS.fat.low) {
        level = 'low';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Low fat.';
      } else if (val100g <= PER_100G_THRESHOLDS.fat.high) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate fat level.';
      } else {
        level = 'high';
        status = 'caution';
        trafficLightColor = 'amber';
        advice = 'High in total fat.';
      }
      break;

    case 'fiber':
      label = 'Dietary Fiber';
      unit = 'g';
      if (val100g >= PER_100G_THRESHOLDS.fiber.high) {
        level = 'very_high';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'High in dietary fiber (beneficial).';
      } else if (val100g >= PER_100G_THRESHOLDS.fiber.good) {
        level = 'high';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Good source of fiber.';
      } else if (val100g >= 1.5) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'amber';
        advice = 'Moderate fiber.';
      } else {
        level = 'low';
        status = 'caution';
        trafficLightColor = 'amber';
        advice = 'Low dietary fiber.';
      }
      break;

    case 'protein':
      label = 'Protein';
      unit = 'g';
      if (val100g >= PER_100G_THRESHOLDS.protein.high) {
        level = 'very_high';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'High protein content (beneficial).';
      } else if (val100g >= PER_100G_THRESHOLDS.protein.good) {
        level = 'high';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Good source of protein.';
      } else if (val100g >= 2.5) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate protein.';
      } else {
        level = 'low';
        status = 'neutral';
        trafficLightColor = 'amber';
        advice = 'Low protein.';
      }
      break;

    case 'sodium':
      label = 'Sodium';
      unit = 'mg';
      if (val100g <= PER_100G_THRESHOLDS.sodium.low) {
        level = 'low';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Low sodium.';
      } else if (val100g <= 400) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate sodium.';
      } else if (val100g <= PER_100G_THRESHOLDS.sodium.high) {
        level = 'high';
        status = 'caution';
        trafficLightColor = 'amber';
        advice = 'Elevated sodium level.';
      } else {
        level = 'very_high';
        status = 'warning';
        trafficLightColor = 'red';
        advice = 'High sodium; monitor daily sodium intake.';
      }
      break;

    case 'salt':
      label = 'Salt';
      unit = 'g';
      if (val100g <= PER_100G_THRESHOLDS.salt.low) {
        level = 'low';
        status = 'favorable';
        trafficLightColor = 'green';
        advice = 'Low salt.';
      } else if (val100g <= 1.0) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate salt.';
      } else if (val100g <= PER_100G_THRESHOLDS.salt.high) {
        level = 'high';
        status = 'caution';
        trafficLightColor = 'amber';
        advice = 'Elevated salt.';
      } else {
        level = 'very_high';
        status = 'warning';
        trafficLightColor = 'red';
        advice = 'High salt content.';
      }
      break;

    case 'carbohydrates':
    default:
      label = 'Carbohydrates';
      unit = 'g';
      if (val100g < 15) {
        level = 'low';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Low carbohydrate count.';
      } else if (val100g < 50) {
        level = 'moderate';
        status = 'neutral';
        trafficLightColor = 'green';
        advice = 'Moderate carbohydrates.';
      } else {
        level = 'high';
        status = 'neutral';
        trafficLightColor = 'amber';
        advice = 'Carbohydrate dense.';
      }
      break;
  }

  return {
    nutrient,
    label,
    valuePer100g: Number(val100g.toFixed(1)),
    valuePerServing: valServing !== undefined ? Number(valServing.toFixed(1)) : undefined,
    unit,
    referenceDailyValue: refDaily,
    percentDailyValue: percentDV,
    level,
    status,
    advice,
    trafficLightColor,
  };
}
