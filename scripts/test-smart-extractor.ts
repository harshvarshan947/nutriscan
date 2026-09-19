import { ProductNutrients } from '../src/types/product';

export function extractNutrientsFromOff(raw: Record<string, any>): {
  nutrients100g: ProductNutrients;
  nutrientsServing?: ProductNutrients;
  servingSize: string;
  servingQuantityGrams?: number;
  isComplete: boolean;
  missingFields: string[];
} {
  const nutriments = raw.nutriments || {};
  const missingFields: string[] = [];

  // Parse serving quantity (grams or ml)
  let servingGrams: number | undefined = raw.serving_quantity ? Number(raw.serving_quantity) : undefined;
  const servingSizeStr: string = raw.serving_size || (servingGrams ? `${servingGrams} g` : '100 g');

  if ((!servingGrams || servingGrams <= 0) && raw.serving_size) {
    const s = String(raw.serving_size);
    const gMatch = s.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:g|ml|gram|gr)/i);
    const ozMatch = s.match(/([0-9]+(?:\.[0-9]+)?)\s*oz/i);
    const flOzMatch = s.match(/([0-9]+(?:\.[0-9]+)?)\s*fl\s*oz/i);

    if (gMatch) {
      servingGrams = Number(gMatch[1]);
    } else if (flOzMatch) {
      servingGrams = Math.round(Number(flOzMatch[1]) * 29.57);
    } else if (ozMatch) {
      servingGrams = Math.round(Number(ozMatch[1]) * 28.35);
    }
  }

  // Smart nutrient extractor supporting standard, prepared, values, and serving fallbacks
  const getNutrientVal = (prefixes: string[]): number | undefined => {
    for (const prefix of prefixes) {
      const candidates = [
        `${prefix}_100g`,
        `${prefix}_value`,
        prefix,
        `${prefix}_prepared_100g`,
        `${prefix}_prepared_value`,
        `${prefix}_prepared`,
      ];

      for (const key of candidates) {
        if (nutriments[key] !== undefined && nutriments[key] !== null && !isNaN(Number(nutriments[key]))) {
          return Number(nutriments[key]);
        }
      }
    }

    // Fallback: check serving keys and convert backwards using servingGrams
    if (servingGrams && servingGrams > 0) {
      for (const prefix of prefixes) {
        const servingCandidates = [`${prefix}_serving`, `${prefix}_prepared_serving`];
        for (const key of servingCandidates) {
          if (nutriments[key] !== undefined && nutriments[key] !== null && !isNaN(Number(nutriments[key]))) {
            const servVal = Number(nutriments[key]);
            return Number(((servVal / servingGrams) * 100).toFixed(2));
          }
        }
      }
    }

    return undefined;
  };

  // 1. Calories / Energy (kcal)
  let calories100g = getNutrientVal(['energy-kcal', 'energy_kcal']);
  if (calories100g === undefined) {
    // Try energy in kJ
    const energyKj = getNutrientVal(['energy', 'energy-kj', 'energy_kj']);
    if (energyKj !== undefined && energyKj > 0) {
      calories100g = Math.round(energyKj > 900 ? energyKj / 4.184 : energyKj);
    }
  }

  // If calories is unreasonably high (>900 kcal/100g) or 0 while macros exist, calculate via Atwater system
  if (calories100g === undefined || calories100g > 900) {
    const rawP = getNutrientVal(['proteins', 'protein']) || 0;
    const rawC = getNutrientVal(['carbohydrates', 'carbohydrate', 'carbs']) || 0;
    const rawF = getNutrientVal(['fat', 'lipids', 'lipides']) || 0;
    if (rawP > 0 || rawC > 0 || rawF > 0) {
      calories100g = Math.round(rawP * 4 + rawC * 4 + rawF * 9);
    } else if (calories100g && calories100g > 900) {
      calories100g = Math.round(calories100g / 4.184);
      if (calories100g > 900) calories100g = Math.round(calories100g / 100);
    }
  }

  if (calories100g === undefined || isNaN(Number(calories100g))) {
    missingFields.push('calories');
    calories100g = 0;
  } else {
    calories100g = Math.round(calories100g);
  }

  // 2. Proteins
  let protein100g = getNutrientVal(['proteins', 'protein']);
  if (protein100g === undefined) {
    missingFields.push('protein');
    protein100g = 0;
  } else {
    protein100g = Number(protein100g.toFixed(1));
  }

  // 3. Carbohydrates
  let carbs100g = getNutrientVal(['carbohydrates', 'carbohydrate', 'carbs']);
  if (carbs100g === undefined) {
    missingFields.push('carbohydrates');
    carbs100g = 0;
  } else {
    carbs100g = Number(carbs100g.toFixed(1));
  }

  // 4. Sugars
  let sugars100g = getNutrientVal(['sugars', 'sugar']);
  if (sugars100g === undefined) {
    missingFields.push('sugars');
    sugars100g = 0;
  } else {
    sugars100g = Number(sugars100g.toFixed(1));
  }

  // 5. Added Sugars
  let addedSugars100g = getNutrientVal(['added-sugars', 'added_sugars', 'added-sugar']);
  if (addedSugars100g !== undefined) {
    addedSugars100g = Number(addedSugars100g.toFixed(1));
  }

  // 6. Fat
  let fat100g = getNutrientVal(['fat', 'lipids', 'lipides']);
  if (fat100g === undefined) {
    missingFields.push('fat');
    fat100g = 0;
  } else {
    fat100g = Number(fat100g.toFixed(1));
  }

  // 7. Saturated Fat
  let satFat100g = getNutrientVal(['saturated-fat', 'saturated_fat', 'saturated-fatty-acids']);
  if (satFat100g === undefined) {
    missingFields.push('saturatedFat');
    satFat100g = 0;
  } else {
    satFat100g = Number(satFat100g.toFixed(1));
  }

  // 8. Fiber
  let fiber100g = getNutrientVal(['fiber', 'fibers', 'fibres', 'dietary-fiber']);
  if (fiber100g === undefined) {
    missingFields.push('fiber');
    fiber100g = 0;
  } else {
    fiber100g = Number(fiber100g.toFixed(1));
  }

  // 9. Sodium & Salt
  let rawSodium = getNutrientVal(['sodium']);
  let rawSalt = getNutrientVal(['salt']);
  let sodium100g = 0;
  let salt100g = 0;

  if (rawSodium !== undefined) {
    // If raw sodium is in grams (< 50), convert to mg
    sodium100g = rawSodium < 50 ? Math.round(rawSodium * 1000) : Math.round(rawSodium);
    salt100g = rawSalt !== undefined ? Number(rawSalt.toFixed(2)) : Number(((sodium100g / 1000) * 2.5).toFixed(2));
  } else if (rawSalt !== undefined) {
    salt100g = Number(rawSalt.toFixed(2));
    sodium100g = Math.round((salt100g / 2.5) * 1000);
  } else {
    missingFields.push('sodium');
  }

  const nutrients100g: ProductNutrients = {
    calories: calories100g,
    protein: protein100g,
    carbohydrates: carbs100g,
    sugars: sugars100g,
    addedSugars: addedSugars100g,
    fat: fat100g,
    saturatedFat: satFat100g,
    fiber: fiber100g,
    sodium: sodium100g,
    salt: salt100g,
  };

  // Calculate per serving
  let nutrientsServing: ProductNutrients | undefined;
  if (servingGrams && servingGrams > 0) {
    const ratio = servingGrams / 100;
    nutrientsServing = {
      calories: Math.round(nutrients100g.calories * ratio),
      protein: Number((nutrients100g.protein * ratio).toFixed(1)),
      carbohydrates: Number((nutrients100g.carbohydrates * ratio).toFixed(1)),
      sugars: Number((nutrients100g.sugars * ratio).toFixed(1)),
      addedSugars: addedSugars100g !== undefined ? Number((addedSugars100g * ratio).toFixed(1)) : undefined,
      fat: Number((nutrients100g.fat * ratio).toFixed(1)),
      saturatedFat: Number((nutrients100g.saturatedFat * ratio).toFixed(1)),
      fiber: Number((nutrients100g.fiber * ratio).toFixed(1)),
      sodium: Math.round(nutrients100g.sodium * ratio),
      salt: Number((nutrients100g.salt * ratio).toFixed(2)),
    };
  }

  return {
    nutrients100g,
    nutrientsServing,
    servingSize: servingSizeStr,
    servingQuantityGrams: servingGrams,
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

async function testExtraction() {
  const testBarcodes = [
    '8585002484093', // Maggi Bouillon (prepared keys)
    '8901058863673', // Maggi Masala
    '7622300336738', // Oreo Original
    '3017620422003', // Nutella
    '0028400070560', // Lays Classic
    '8901491101844', // Lays India
  ];

  for (const b of testBarcodes) {
    const url = `https://world.openfoodfacts.org/api/v2/product/${b}.json`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan - Test' } });
      const data = await res.json();
      if (data.product) {
        const result = extractNutrientsFromOff(data.product);
        console.log(`\nProduct: "${data.product.product_name}" (${b})`);
        console.log(`  Serving: ${result.servingSize} (${result.servingQuantityGrams}g)`);
        console.log(`  Nutrients 100g: Calories=${result.nutrients100g.calories} kcal, Protein=${result.nutrients100g.protein}g, Carbs=${result.nutrients100g.carbohydrates}g, Sugars=${result.nutrients100g.sugars}g, Fat=${result.nutrients100g.fat}g, SatFat=${result.nutrients100g.saturatedFat}g, Fiber=${result.nutrients100g.fiber}g, Sodium=${result.nutrients100g.sodium}mg, Salt=${result.nutrients100g.salt}g`);
      }
    } catch (e: any) {
      console.error(`Error for ${b}:`, e.message);
    }
  }
}

testExtraction();
