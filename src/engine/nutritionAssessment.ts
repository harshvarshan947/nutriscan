import { ProductDetails, ProductNutrients } from '../types/product';
import {
  AssessmentFactor,
  HealthAssessmentResult,
  NutrientRating,
  QualityTier,
  ReferenceProfile,
} from '../types/assessment';
import { REFERENCE_STANDARDS } from './nutritionThresholds';
import { evaluateNutrient } from './nutritionScore';

export function calculateHealthAssessment(
  product: ProductDetails,
  customReferenceProfile?: ReferenceProfile
): HealthAssessmentResult {
  const refProfile = customReferenceProfile || REFERENCE_STANDARDS.general_adult;
  const n100 = product.nutrients100g;
  const nServ = product.nutrientsServing;

  // 1. Evaluate individual nutrients
  const nutrientKeys: (keyof ProductNutrients)[] = [
    'calories',
    'protein',
    'carbohydrates',
    'sugars',
    'addedSugars',
    'fat',
    'saturatedFat',
    'fiber',
    'sodium',
    'salt',
  ];

  const ratings = {} as Record<keyof ProductNutrients, NutrientRating>;
  for (const k of nutrientKeys) {
    const val100 = n100[k] ?? 0;
    const valServ = nServ ? nServ[k] : undefined;
    ratings[k] = evaluateNutrient(k, val100, valServ, refProfile);
  }

  // 2. Compute Transparent Rule-Based Quality Score (0 to 100)
  // Base score 100
  let score = 80; // Baseline starting score for average neutral food
  const positiveFactors: AssessmentFactor[] = [];
  const cautionFactors: AssessmentFactor[] = [];

  // FIBER
  if (n100.fiber >= 6.0) {
    score += 12;
    positiveFactors.push({
      id: 'high-fiber',
      type: 'positive',
      icon: 'zap',
      title: 'High in Dietary Fiber',
      description: 'Excellent fiber content supporting digestion and healthy satiety.',
      metric: `${n100.fiber}g / 100g`,
    });
  } else if (n100.fiber >= 3.0) {
    score += 6;
    positiveFactors.push({
      id: 'good-fiber',
      type: 'positive',
      icon: 'check',
      title: 'Good Source of Fiber',
      description: 'Contributes positively to your daily fiber target.',
      metric: `${n100.fiber}g / 100g`,
    });
  } else if (n100.calories > 300 && n100.fiber < 1.0) {
    score -= 6;
    cautionFactors.push({
      id: 'low-fiber-energy',
      type: 'caution',
      icon: 'alert-triangle',
      title: 'Low Fiber Relative to Calories',
      description: 'Provides energy with minimal dietary fiber.',
      metric: `${n100.fiber}g fiber for ${n100.calories} kcal`,
    });
  }

  // PROTEIN
  if (n100.protein >= 15.0) {
    score += 10;
    positiveFactors.push({
      id: 'high-protein',
      type: 'positive',
      icon: 'zap',
      title: 'High Protein Content',
      description: 'Great protein density for muscle repair and long-lasting fullness.',
      metric: `${n100.protein}g / 100g`,
    });
  } else if (n100.protein >= 8.0) {
    score += 5;
    positiveFactors.push({
      id: 'good-protein',
      type: 'positive',
      icon: 'check',
      title: 'Good Source of Protein',
      description: 'Provides a solid protein contribution per serving.',
      metric: `${n100.protein}g / 100g`,
    });
  }

  // SUGAR (Standard UK/EU threshold: >22.5g/100g or >13.5g per portion / >9g/100ml for beverages)
  const isBeverage = product.categories?.some((c) =>
    c.toLowerCase().includes('beverage') || c.toLowerCase().includes('drink') || c.toLowerCase().includes('soda')
  );
  const sugarServing = nServ?.sugars ?? n100.sugars;

  if (n100.sugars <= 2.5 && sugarServing <= 5.0) {
    score += 8;
    positiveFactors.push({
      id: 'low-sugar',
      type: 'positive',
      icon: 'check',
      title: 'Low in Sugar',
      description: 'Minimal impact on blood sugar spikes.',
      metric: `${n100.sugars}g / 100g`,
    });
  } else if (n100.sugars > 22.5 || sugarServing >= 20.0 || (isBeverage && n100.sugars > 8.0)) {
    const penalty = Math.min(28, 14 + Math.round(sugarServing >= 20 ? (sugarServing - 20) * 0.7 : (n100.sugars - 8) * 0.8));
    score -= penalty;
    cautionFactors.push({
      id: 'high-sugar',
      type: 'warning',
      icon: 'alert-circle',
      title: 'High Sugar Content',
      description: 'Exceeds recommended healthy sugar limits per serving/100g.',
      metric: `${nServ ? `${nServ.sugars}g / serving` : `${n100.sugars}g / 100g`} (${ratings.sugars.percentDailyValue}% Daily Ref)`,
    });
  } else if (n100.sugars > 10.0 || sugarServing >= 12.0) {
    score -= 8;
    cautionFactors.push({
      id: 'moderate-high-sugar',
      type: 'caution',
      icon: 'alert-triangle',
      title: 'Moderate to High Sugar',
      description: 'Contains a noticeable concentration of simple sugars.',
      metric: `${nServ ? `${nServ.sugars}g / serving` : `${n100.sugars}g / 100g`}`,
    });
  }

  // SATURATED FAT
  if (n100.saturatedFat <= 1.5) {
    score += 5;
    positiveFactors.push({
      id: 'low-sat-fat',
      type: 'positive',
      icon: 'heart',
      title: 'Low in Saturated Fat',
      description: 'Heart-friendly fat profile.',
      metric: `${n100.saturatedFat}g / 100g`,
    });
  } else if (n100.saturatedFat > 7.0) {
    const penalty = Math.min(22, 10 + Math.round((n100.saturatedFat - 7.0) * 1.2));
    score -= penalty;
    cautionFactors.push({
      id: 'high-sat-fat',
      type: 'warning',
      icon: 'alert-circle',
      title: 'High Saturated Fat',
      description: 'Exceeds healthy threshold for saturated fatty acids.',
      metric: `${n100.saturatedFat}g / 100g (${ratings.saturatedFat.percentDailyValue}% Daily Ref)`,
    });
  } else if (n100.saturatedFat > 4.0) {
    score -= 6;
    cautionFactors.push({
      id: 'moderate-sat-fat',
      type: 'caution',
      icon: 'alert-triangle',
      title: 'Moderate Saturated Fat',
      description: 'Consider balancing with unsaturated fat sources throughout the day.',
      metric: `${n100.saturatedFat}g / 100g`,
    });
  }

  // SODIUM / SALT
  if (n100.sodium <= 120) {
    score += 6;
    positiveFactors.push({
      id: 'low-sodium',
      type: 'positive',
      icon: 'check',
      title: 'Low Sodium / Salt',
      description: 'Safe for sodium-conscious and cardiovascular diets.',
      metric: `${n100.sodium}mg sodium / 100g`,
    });
  } else if (n100.sodium > 800) {
    const penalty = Math.min(22, 10 + Math.round((n100.sodium - 800) / 100));
    score -= penalty;
    cautionFactors.push({
      id: 'high-sodium',
      type: 'warning',
      icon: 'alert-circle',
      title: 'High Sodium Content',
      description: 'Substantial sodium concentration per serving.',
      metric: `${n100.sodium}mg sodium (${n100.salt}g salt / 100g)`,
    });
  } else if (n100.sodium > 450) {
    score -= 6;
    cautionFactors.push({
      id: 'moderate-sodium',
      type: 'caution',
      icon: 'alert-triangle',
      title: 'Elevated Sodium Level',
      description: 'Moderately high salt/sodium density.',
      metric: `${n100.sodium}mg sodium / 100g`,
    });
  }

  // NOVA ULTRA-PROCESSING CLASSIFICATION
  let novaInsight: HealthAssessmentResult['novaInsight'];
  if (product.novaGroup === 1) {
    score += 8;
    novaInsight = {
      group: 1,
      title: 'NOVA 1: Unprocessed / Minimally Processed',
      explanation: 'Whole foods or basic foods with minimal alteration. Highly recommended as dietary staple.',
    };
    positiveFactors.push({
      id: 'nova-1',
      type: 'positive',
      icon: 'check',
      title: 'Whole / Minimally Processed Food',
      description: 'Natural ingredients with no industrial modification.',
    });
  } else if (product.novaGroup === 2) {
    score += 2;
    novaInsight = {
      group: 2,
      title: 'NOVA 2: Processed Culinary Ingredients',
      explanation: 'Oils, butter, sugar, or salt used in combination with whole foods.',
    };
  } else if (product.novaGroup === 3) {
    novaInsight = {
      group: 3,
      title: 'NOVA 3: Processed Foods',
      explanation: 'Simple canned foods, cheeses, or breads preserved with culinary ingredients.',
    };
  } else if (product.novaGroup === 4) {
    score -= 10;
    novaInsight = {
      group: 4,
      title: 'NOVA 4: Ultra-Processed Food',
      explanation: 'Formulation of ingredients created mostly from industrial substances with additives.',
    };
    cautionFactors.push({
      id: 'nova-4-ultra',
      type: 'caution',
      icon: 'alert-triangle',
      title: 'Ultra-Processed Formulation (NOVA 4)',
      description: 'Contains industrial formulations or flavor enhancers.',
    });
  }

  // ALLERGENS OR ADDITIVES
  const highRiskAdditives = product.additives.filter((a) => a.riskLevel === 'caution' || a.riskLevel === 'high_risk');
  if (highRiskAdditives.length > 0) {
    score -= Math.min(8, highRiskAdditives.length * 3);
    cautionFactors.push({
      id: 'additives-flag',
      type: 'caution',
      icon: 'alert-triangle',
      title: `${highRiskAdditives.length} Additive(s) of Note`,
      description: `Contains ${highRiskAdditives.map((a) => a.name || a.id).join(', ')}.`,
    });
  }

  // Clamp final score between 5 and 100
  const finalScore = Math.max(5, Math.min(100, score));

  // Determine Quality Tier
  let qualityTier: QualityTier = 'Moderate';
  let summaryHeadline = 'Moderate nutritional quality';

  if (finalScore >= 80) {
    qualityTier = 'Excellent';
    summaryHeadline = 'Nutrient-dense with favorable balance';
  } else if (finalScore >= 65) {
    qualityTier = 'Good';
    summaryHeadline = 'Good nutritional profile with minor cautions';
  } else if (finalScore >= 45) {
    qualityTier = 'Moderate';
    summaryHeadline = 'Moderate quality; consume in balanced rotation';
  } else {
    qualityTier = 'Low';
    summaryHeadline = 'Lower nutrient density; enjoy mindfully in moderation';
  }

  return {
    qualityScore: finalScore,
    qualityTier,
    summaryHeadline,
    ratings,
    positiveFactors,
    cautionFactors,
    referenceProfile: refProfile,
    novaInsight,
    disclaimer:
      'This nutrition quality estimate is calculated using standardized dietary reference guidelines for general informational purposes. It does not constitute medical advice or a diagnosis.',
    generatedAt: Date.now(),
  };
}
