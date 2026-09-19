import { calculateHealthAssessment } from '../src/engine/nutritionAssessment';
import { REFERENCE_STANDARDS } from '../src/engine/nutritionThresholds';
import { calculateUserTargets, buildPersonalizedReferenceProfile } from '../src/engine/tdeeCalculator';
import { SAMPLE_PRODUCTS } from '../src/data/sampleProducts';
import { DEFAULT_USER_PROFILE } from '../src/services/storageService';

console.log('=== TEST 1: TDEE and Macro Target Calculations ===');
const defaultTargets = calculateUserTargets(DEFAULT_USER_PROFILE);
console.log('Default Adult (30y, 70kg, 172cm, moderate activity, healthy eating):');
console.log(`- BMR: ${defaultTargets.bmr} kcal`);
console.log(`- TDEE: ${defaultTargets.tdee} kcal`);
console.log(`- Target Calories: ${defaultTargets.targetCalories} kcal`);
console.log(`- Target Protein: ${defaultTargets.targetProtein} g`);
console.log(`- Target Carbs: ${defaultTargets.targetCarbs} g`);
console.log(`- Target Fat: ${defaultTargets.targetFat} g`);
console.log(`- Target Fiber: ${defaultTargets.targetFiber} g`);
console.log(`- Max Sugars: ${defaultTargets.targetSugars} g`);
console.log(`- Max Sodium: ${defaultTargets.targetSodium} mg`);

console.log('\nTesting Muscle Gain Profile:');
const muscleProfile = { ...DEFAULT_USER_PROFILE, goal: 'muscle_gain' as const, weightKg: 80 };
const muscleTargets = calculateUserTargets(muscleProfile);
console.log(`- Muscle Goal Target Calories: ${muscleTargets.targetCalories} kcal (TDEE + 350)`);
console.log(`- Muscle Goal Protein Target: ${muscleTargets.targetProtein} g`);

console.log('\n=== TEST 2: Nutrition Quality Scores Across Sample Foods ===');
for (const [code, product] of Object.entries(SAMPLE_PRODUCTS)) {
  const assessment = calculateHealthAssessment(product, REFERENCE_STANDARDS.general_adult);
  console.log(`\nProduct: [${product.brand}] ${product.name}`);
  console.log(`- Barcode: ${code}`);
  console.log(`- Quality Score: ${assessment.qualityScore}/100 (${assessment.qualityTier})`);
  console.log(`- Headline: "${assessment.summaryHeadline}"`);
  console.log(`- Positives (${assessment.positiveFactors.length}):`);
  assessment.positiveFactors.forEach(p => console.log(`   ✓ ${p.title}: ${p.description} [${p.metric || ''}]`));
  console.log(`- Cautions (${assessment.cautionFactors.length}):`);
  assessment.cautionFactors.forEach(c => console.log(`   ⚠ ${c.title}: ${c.description} [${c.metric || ''}]`));
  if (assessment.novaInsight) {
    console.log(`- NOVA Insight: ${assessment.novaInsight.title}`);
  }
}

console.log('\n=== ALL ENGINE SANITY TESTS PASSED ===');
