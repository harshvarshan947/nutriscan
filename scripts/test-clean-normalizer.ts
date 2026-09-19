import { ProductDetails, ProductNutrients } from '../src/types/product';
import { estimateNutrientsFromTitle } from '../src/engine/nutritionEstimator';

export function normalizeOffProductClean(barcode: string, raw: Record<string, any>): ProductDetails {
  const nutriments = raw.nutriments || {};
  const missingFields: string[] = [];

  // Parse raw 100g values directly from official Open Food Facts fields
  let cal100: number | undefined = nutriments['energy-kcal_100g'] !== undefined ? Number(nutriments['energy-kcal_100g']) : undefined;
  if (cal100 === undefined && nutriments['energy_100g'] !== undefined) {
    const kj = Number(nutriments['energy_100g']);
    if (!isNaN(kj) && kj > 0) {
      cal100 = Math.round(kj / 4.184);
    }
  }
  if (cal100 === undefined && nutriments['energy-kj_100g'] !== undefined) {
    const kj = Number(nutriments['energy-kj_100g']);
    if (!isNaN(kj) && kj > 0) {
      cal100 = Math.round(kj / 4.184);
    }
  }

  // Prepared fallbacks for soups, noodles, bouillons
  if (cal100 === undefined && nutriments['energy-kcal_prepared_100g'] !== undefined) {
    cal100 = Number(nutriments['energy-kcal_prepared_100g']);
  }

  const get100 = (primaryKey: string, prepKey: string): number | undefined => {
    if (nutriments[primaryKey] !== undefined && nutriments[primaryKey] !== null && !isNaN(Number(nutriments[primaryKey]))) {
      return Number(nutriments[primaryKey]);
    }
    if (nutriments[prepKey] !== undefined && nutriments[prepKey] !== null && !isNaN(Number(nutriments[prepKey]))) {
      return Number(nutriments[prepKey]);
    }
    return undefined;
  };

  const protein100 = get100('proteins_100g', 'proteins_prepared_100g');
  const carbs100 = get100('carbohydrates_100g', 'carbohydrates_prepared_100g');
  const sugars100 = get100('sugars_100g', 'sugars_prepared_100g');
  const addedSugars100 = nutriments['added-sugars_100g'] !== undefined ? Number(nutriments['added-sugars_100g']) : undefined;
  const fat100 = get100('fat_100g', 'fat_prepared_100g');
  const satFat100 = get100('saturated-fat_100g', 'saturated-fat_prepared_100g');
  const fiber100 = get100('fiber_100g', 'fiber_prepared_100g');

  // Sodium / Salt (sodium in OFF is in grams, convert to mg)
  let sodium100: number | undefined;
  let salt100: number | undefined;

  if (nutriments['sodium_100g'] !== undefined && !isNaN(Number(nutriments['sodium_100g']))) {
    const rawSodium = Number(nutriments['sodium_100g']);
    sodium100 = rawSodium < 50 ? Math.round(rawSodium * 1000) : Math.round(rawSodium);
  }
  if (nutriments['salt_100g'] !== undefined && !isNaN(Number(nutriments['salt_100g']))) {
    salt100 = Number(Number(nutriments['salt_100g']).toFixed(2));
    if (sodium100 === undefined) {
      sodium100 = Math.round((salt100 / 2.5) * 1000);
    }
  } else if (sodium100 !== undefined) {
    salt100 = Number(((sodium100 / 1000) * 2.5).toFixed(2));
  }

  // Sanity check calories: Atwater formula if malformed (>900 kcal or empty with macros)
  const pVal = protein100 || 0;
  const cVal = carbs100 || 0;
  const fVal = fat100 || 0;

  if (cal100 === undefined || cal100 > 900 || (cal100 === 0 && (pVal > 0 || cVal > 0 || fVal > 0))) {
    if (pVal > 0 || cVal > 0 || fVal > 0) {
      cal100 = Math.round(pVal * 4 + cVal * 4 + fVal * 9);
    } else if (cal100 && cal100 > 900) {
      cal100 = Math.round(cal100 / 4.184);
      if (cal100 > 900) cal100 = Math.round(cal100 / 100);
    }
  }

  let finalCal = cal100 !== undefined ? Math.round(cal100) : 0;
  let finalProt = protein100 !== undefined ? Number(protein100.toFixed(1)) : 0;
  let finalCarb = carbs100 !== undefined ? Number(carbs100.toFixed(1)) : 0;
  let finalSug = sugars100 !== undefined ? Number(sugars100.toFixed(1)) : 0;
  let finalFat = fat100 !== undefined ? Number(fat100.toFixed(1)) : 0;
  let finalSatFat = satFat100 !== undefined ? Number(satFat100.toFixed(1)) : 0;
  let finalFib = fiber100 !== undefined ? Number(fiber100.toFixed(1)) : 0;
  let finalSod = sodium100 !== undefined ? sodium100 : 0;
  let finalSalt = salt100 !== undefined ? salt100 : 0;

  const name = raw.product_name || raw.product_name_en || 'Packaged Product';
  const brand = raw.brands || raw.brand_owner || 'Unknown Brand';
  const nameLower = `${name} ${brand}`.toLowerCase();

  const isZeroCalFood = nameLower.includes('water') || nameLower.includes('diet') || nameLower.includes('zero') || nameLower.includes('tea') || nameLower.includes('coffee') || nameLower.includes('sugar free');

  let isEstimated = false;
  let estimatedCategory: string | undefined;

  // Only apply category estimation if all macros and calories are 0 AND not a zero-calorie food
  if (finalCal === 0 && finalProt === 0 && finalCarb === 0 && finalFat === 0 && !isZeroCalFood) {
    const est = estimateNutrientsFromTitle(name, brand, raw.categories_tags);
    if (est) {
      finalCal = est.nutrients100g.calories;
      finalProt = est.nutrients100g.protein;
      finalCarb = est.nutrients100g.carbohydrates;
      finalSug = est.nutrients100g.sugars;
      finalFat = est.nutrients100g.fat;
      finalSatFat = est.nutrients100g.saturatedFat;
      finalFib = est.nutrients100g.fiber;
      finalSod = est.nutrients100g.sodium;
      finalSalt = est.nutrients100g.salt;
      isEstimated = true;
      estimatedCategory = est.categoryLabel;
    }
  }

  const nutrients100g: ProductNutrients = {
    calories: finalCal,
    protein: finalProt,
    carbohydrates: finalCarb,
    sugars: finalSug,
    addedSugars: addedSugars100 !== undefined ? Number(addedSugars100.toFixed(1)) : undefined,
    fat: finalFat,
    saturatedFat: finalSatFat,
    fiber: finalFib,
    sodium: finalSod,
    salt: finalSalt,
  };

  // Parse serving
  let servingGrams = raw.serving_quantity ? Number(raw.serving_quantity) : undefined;
  let servingSizeStr = raw.serving_size || (servingGrams ? `${servingGrams} g` : '100 g');

  // Sanitize serving quantity (e.g. if someone put full pack 250g/500g for chips/biscuits)
  if (servingGrams && servingGrams > 150 && (nameLower.includes('biscuit') || nameLower.includes('cookie') || nameLower.includes('chip') || nameLower.includes('chocolate') || nameLower.includes('bar'))) {
    servingGrams = 30;
    servingSizeStr = '30 g (approx. 1 portion)';
  }

  // Calculate per serving using mathematical consistency
  let nutrientsServing: ProductNutrients | undefined;
  if (servingGrams && servingGrams > 0) {
    const ratio = servingGrams / 100;
    nutrientsServing = {
      calories: Math.round(nutrients100g.calories * ratio),
      protein: Number((nutrients100g.protein * ratio).toFixed(1)),
      carbohydrates: Number((nutrients100g.carbohydrates * ratio).toFixed(1)),
      sugars: Number((nutrients100g.sugars * ratio).toFixed(1)),
      addedSugars: nutrients100g.addedSugars !== undefined ? Number((nutrients100g.addedSugars * ratio).toFixed(1)) : undefined,
      fat: Number((nutrients100g.fat * ratio).toFixed(1)),
      saturatedFat: Number((nutrients100g.saturatedFat * ratio).toFixed(1)),
      fiber: Number((nutrients100g.fiber * ratio).toFixed(1)),
      sodium: Math.round(nutrients100g.sodium * ratio),
      salt: Number((nutrients100g.salt * ratio).toFixed(2)),
    };
  }

  return {
    barcode,
    name,
    brand,
    image: raw.image_front_url || raw.image_url,
    thumbnail: raw.image_front_small_url,
    servingSize: servingSizeStr,
    servingQuantityGrams: servingGrams,
    nutrients100g,
    nutrientsServing,
    ingredientsText: raw.ingredients_text || '',
    ingredientsList: [],
    allergens: [],
    additives: [],
    source: 'openfoodfacts',
    isComplete: true,
    missingFields: [],
    isEstimated,
    estimatedCategory,
    lastUpdated: Date.now(),
  };
}

async function testClean() {
  const codes = [
    '3017620422003', // Nutella
    '5449000000996', // Coca Cola
    '0028400070560', // Doritos
    '7622210449283', // Prince LU Biscuits
    '5000159461122', // Snickers
  ];

  for (const c of codes) {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${c}.json`, { headers: { 'User-Agent': 'NutriScan - Test' } });
    const data = await res.json();
    const parsed = normalizeOffProductClean(c, data.product);
    console.log(`\nProduct: "${parsed.name}" (${parsed.brand})`);
    console.log(`  Per 100g: ${parsed.nutrients100g.calories} kcal | ${parsed.nutrients100g.protein}g protein | ${parsed.nutrients100g.carbohydrates}g carbs | ${parsed.nutrients100g.sugars}g sugar | ${parsed.nutrients100g.fat}g fat | ${parsed.nutrients100g.saturatedFat}g sat fat | ${parsed.nutrients100g.sodium}mg sodium`);
    if (parsed.nutrientsServing) {
      console.log(`  Per Serving (${parsed.servingSize}): ${parsed.nutrientsServing.calories} kcal | ${parsed.nutrientsServing.protein}g protein | ${parsed.nutrientsServing.carbohydrates}g carbs | ${parsed.nutrientsServing.sugars}g sugar | ${parsed.nutrientsServing.fat}g fat | ${parsed.nutrientsServing.saturatedFat}g sat fat | ${parsed.nutrientsServing.sodium}mg sodium`);
    }
  }
}

testClean();
