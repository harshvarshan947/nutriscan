import { ProductDetails, ProductNutrients } from '../types/product';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import { lookupAdditive } from '../data/additiveDirectory';
import { storageService } from './storageService';
import { estimateNutrientsFromTitle } from '../engine/nutritionEstimator';

// High-reliability mirror hosts for Open Food Facts
const OFF_MIRROR_NET = 'https://world.openfoodfacts.net';
const OFF_MIRROR_ORG = 'https://world.openfoodfacts.org';

interface OffApiResponse {
  status?: number;
  status_verbose?: string;
  code?: string;
  count?: number;
  product?: Record<string, any>;
  products?: Record<string, any>[];
}

export const productService = {
  /**
   * Look up a product by barcode with parallel multi-variant search & fast failover
   */
  async getProduct(barcode: string): Promise<ProductDetails | null> {
    const rawBarcode = barcode.replace(/[^0-9a-zA-Z]/g, '').trim();
    if (!rawBarcode) return null;

    // 1. Generate candidate barcode variants (UPC-12, EAN-13, GTIN-14, zero-padding, leading zero stripping)
    const candidateBarcodes = this.generateBarcodeVariants(rawBarcode);

    // 2. Check local IndexedDB cache for any candidate
    for (const code of candidateBarcodes) {
      const cached = await storageService.getCachedProduct(code);
      if (cached) return cached;
    }

    // 3. Check sample / preloaded database for any candidate
    for (const code of candidateBarcodes) {
      if (SAMPLE_PRODUCTS[code]) {
        const sample = SAMPLE_PRODUCTS[code];
        await storageService.cacheProduct(sample);
        return sample;
      }
    }

    // 4. Fetch from Open Food Facts API in parallel across high-speed mirrors
    const fetchPromises = candidateBarcodes.flatMap((code) => [
      this.fetchProductFromEndpoint(`${OFF_MIRROR_NET}/api/v2/product/${code}.json`, rawBarcode),
      this.fetchProductFromEndpoint(`${OFF_MIRROR_ORG}/api/v2/product/${code}.json`, rawBarcode),
      this.fetchProductFromEndpoint(`${OFF_MIRROR_NET}/api/v0/product/${code}.json`, rawBarcode),
      this.fetchProductFromEndpoint(`${OFF_MIRROR_ORG}/api/v0/product/${code}.json`, rawBarcode),
    ]);

    try {
      const results = await Promise.allSettled(fetchPromises);
      for (const res of results) {
        if (res.status === 'fulfilled' && res.value) {
          await storageService.cacheProduct(res.value);
          return res.value;
        }
      }
    } catch (err) {
      // Continue to search fallback
    }

    // 5. Fallback: Search Open Food Facts by barcode text query
    try {
      const searchMatches = await this.searchProducts(rawBarcode);
      if (searchMatches.length > 0) {
        const best = searchMatches[0];
        await storageService.cacheProduct(best);
        return best;
      }
    } catch (err) {
      // Ignore
    }

    return null;
  },

  /**
   * Helper: Fetch and parse a single product from an endpoint with timeout
   */
  async fetchProductFromEndpoint(url: string, rawBarcode: string): Promise<ProductDetails | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'NutriScan - WebApp - Version 1.0 (contact@nutriscan.app)',
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('json')) {
          const data: OffApiResponse = await res.json();
          if (data.status === 1 && data.product && (data.product.product_name || data.product.product_name_en)) {
            return this.normalizeOffProduct(rawBarcode, data.product);
          }
        }
      }
    } catch (err) {
      // Ignore error for this endpoint
    }
    return null;
  },

  /**
   * Helper: Generate common barcode variants (12-digit UPC to 13-digit EAN, 14-digit GTIN, leading 0s)
   */
  generateBarcodeVariants(barcode: string): string[] {
    const variants = new Set<string>();
    variants.add(barcode);

    // If 12-digit UPC-A, add 13-digit EAN with leading 0 and 14-digit GTIN with 00
    if (barcode.length === 12) {
      variants.add(`0${barcode}`);
      variants.add(`00${barcode}`);
    }

    // If 13-digit starting with 0, add 12-digit UPC without leading 0
    if (barcode.length === 13 && barcode.startsWith('0')) {
      variants.add(barcode.slice(1));
    }

    // Stripped leading zeros
    const stripped = barcode.replace(/^0+/, '');
    if (stripped && stripped !== barcode) {
      variants.add(stripped);
    }

    // Padded 13-digit EAN and 14-digit GTIN
    if (barcode.length < 13) {
      variants.add(barcode.padStart(13, '0'));
    }
    if (barcode.length < 14) {
      variants.add(barcode.padStart(14, '0'));
    }

    return Array.from(variants);
  },

  /**
   * Search Open Food Facts by keywords / text query
   */
  async searchProducts(query: string): Promise<ProductDetails[]> {
    const q = query.trim();
    if (!q) return [];

    // Search in sample & standard items first
    const sampleMatches = Object.values(SAMPLE_PRODUCTS).filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase()) ||
        p.barcode.includes(q) ||
        (p.categories && p.categories.some((c) => c.toLowerCase().includes(q.toLowerCase())))
    );

    // Use reliable search parameters (search_simple=1&action=process&json=1) to prevent 503 Cloudflare blocks
    const searchUrls = [
      `${OFF_MIRROR_NET}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=30`,
      `${OFF_MIRROR_ORG}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=30`,
    ];

    const fetchSearchMirror = async (url: string): Promise<ProductDetails[]> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'NutriScan - WebApp - Version 1.0 (contact@nutriscan.app)',
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('json')) {
            const data: OffApiResponse = await response.json();
            if (data.products && Array.isArray(data.products) && data.products.length > 0) {
              return data.products
                .filter((p: any) => p.code && (p.product_name || p.product_name_en))
                .map((p: any) => this.normalizeOffProduct(p.code, p));
            }
          }
        }
      } catch (e) {
        // ignore
      } finally {
        clearTimeout(timeoutId);
      }
      return [];
    };

    try {
      const fetchedResults = await Promise.any(
        searchUrls.map((url) =>
          fetchSearchMirror(url).then((res) => {
            if (res.length > 0) return res;
            throw new Error('No items from this mirror');
          })
        )
      );

      // Combine with sample matches (deduplicating by barcode)
      const seen = new Set<string>();
      const combined: ProductDetails[] = [];

      for (const item of [...sampleMatches, ...fetchedResults]) {
        if (!seen.has(item.barcode)) {
          seen.add(item.barcode);
          combined.push(item);
          storageService.cacheProduct(item);
        }
      }

      // Sort results: complete records with calories/macros and images first
      combined.sort((a, b) => {
        // Exact search term in name gets top priority
        const aNameMatch = a.name.toLowerCase().includes(q.toLowerCase()) ? 2 : 0;
        const bNameMatch = b.name.toLowerCase().includes(q.toLowerCase()) ? 2 : 0;
        if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;

        const aComplete = a.nutrients100g.calories > 0 ? 1 : 0;
        const bComplete = b.nutrients100g.calories > 0 ? 1 : 0;
        if (aComplete !== bComplete) return bComplete - aComplete;

        const aImg = a.image ? 1 : 0;
        const bImg = b.image ? 1 : 0;
        return bImg - aImg;
      });

      return combined;
    } catch (err) {
      // Return sample matches if all network mirrors failed
    }

    return sampleMatches;
  },

  /**
   * Smart Normalized Nutrition & Ingredient Parser
   */
  normalizeOffProduct(barcode: string, raw: Record<string, any>): ProductDetails {
    const nutriments = raw.nutriments || {};
    const missingFields: string[] = [];

    // Clean product title
    const rawName = raw.product_name_en || raw.product_name || raw.generic_name_en || raw.generic_name || 'Packaged Product';
    const name = String(rawName).replace(/\s+/g, ' ').trim();

    // Clean brand name
    let brandRaw = raw.brands || raw.brand_owner || raw.brands_tags?.[0] || 'Unknown Brand';
    if (typeof brandRaw === 'string' && brandRaw.includes(',')) {
      brandRaw = brandRaw.split(',')[0].trim();
    }
    const brand = String(brandRaw).replace(/^[a-z]{2}:/, '').replace(/\s+/g, ' ').trim();
    const nameLower = `${name} ${brand}`.toLowerCase();

    // Parse serving size & grams
    let servingGrams = raw.serving_quantity ? Number(raw.serving_quantity) : undefined;
    let servingSizeStr = raw.serving_size || (servingGrams ? `${servingGrams} g` : '100 g');

    // Parse serving grams from serving string if serving_quantity missing
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

    // Helper: extracts nutrient checking 100g, values, raw, prepared, and serving backwards calculations
    const getNutrientVal100g = (keys: string[]): number | undefined => {
      for (const k of keys) {
        if (nutriments[k] !== undefined && nutriments[k] !== null && !isNaN(Number(nutriments[k]))) {
          return Number(nutriments[k]);
        }
      }
      return undefined;
    };

    // 1. Calories / Energy (kcal) per 100g
    let cal100 = getNutrientVal100g([
      'energy-kcal_100g',
      'energy-kcal_value',
      'energy-kcal',
      'energy-kcal_prepared_100g',
    ]);

    // If kcal_100g missing, convert from kJ (energy_100g or energy-kj_100g)
    if (cal100 === undefined) {
      const kjVal = getNutrientVal100g(['energy_100g', 'energy-kj_100g', 'energy_kj']);
      if (kjVal !== undefined && kjVal > 0) {
        cal100 = Math.round(kjVal / 4.184);
      }
    }

    // If still missing, reverse calculate from serving if serving and serving_quantity exist
    if (cal100 === undefined && nutriments['energy-kcal_serving'] && servingGrams && servingGrams > 0) {
      const servKcal = Number(nutriments['energy-kcal_serving']);
      if (!isNaN(servKcal) && servKcal > 0) {
        cal100 = Math.round((servKcal / servingGrams) * 100);
      }
    }

    // 2. Proteins per 100g
    let protein100 = getNutrientVal100g([
      'proteins_100g',
      'proteins_value',
      'proteins',
      'proteins_prepared_100g',
    ]);
    if (protein100 === undefined && nutriments['proteins_serving'] && servingGrams && servingGrams > 0) {
      protein100 = Number(((Number(nutriments['proteins_serving']) / servingGrams) * 100).toFixed(1));
    }

    // 3. Carbohydrates per 100g
    let carbs100 = getNutrientVal100g([
      'carbohydrates_100g',
      'carbohydrates_value',
      'carbohydrates',
      'carbohydrates_prepared_100g',
    ]);
    if (carbs100 === undefined && nutriments['carbohydrates_serving'] && servingGrams && servingGrams > 0) {
      carbs100 = Number(((Number(nutriments['carbohydrates_serving']) / servingGrams) * 100).toFixed(1));
    }

    // 4. Total Sugars per 100g
    let sugars100 = getNutrientVal100g([
      'sugars_100g',
      'sugars_value',
      'sugars',
      'sugars_prepared_100g',
    ]);
    if (sugars100 === undefined && nutriments['sugars_serving'] && servingGrams && servingGrams > 0) {
      sugars100 = Number(((Number(nutriments['sugars_serving']) / servingGrams) * 100).toFixed(1));
    }

    // 5. Added Sugars per 100g
    const addedSugars100 = getNutrientVal100g([
      'added-sugars_100g',
      'added-sugars_value',
      'added-sugars',
    ]);

    // 6. Total Fat per 100g
    let fat100 = getNutrientVal100g([
      'fat_100g',
      'fat_value',
      'fat',
      'fat_prepared_100g',
    ]);
    if (fat100 === undefined && nutriments['fat_serving'] && servingGrams && servingGrams > 0) {
      fat100 = Number(((Number(nutriments['fat_serving']) / servingGrams) * 100).toFixed(1));
    }

    // 7. Saturated Fat per 100g
    let satFat100 = getNutrientVal100g([
      'saturated-fat_100g',
      'saturated-fat_value',
      'saturated-fat',
      'saturated-fat_prepared_100g',
    ]);
    if (satFat100 === undefined && nutriments['saturated-fat_serving'] && servingGrams && servingGrams > 0) {
      satFat100 = Number(((Number(nutriments['saturated-fat_serving']) / servingGrams) * 100).toFixed(1));
    }

    // 8. Fiber per 100g
    let fiber100 = getNutrientVal100g([
      'fiber_100g',
      'fiber_value',
      'fiber',
      'dietary-fiber_100g',
      'fiber_prepared_100g',
    ]);
    if (fiber100 === undefined && nutriments['fiber_serving'] && servingGrams && servingGrams > 0) {
      fiber100 = Number(((Number(nutriments['fiber_serving']) / servingGrams) * 100).toFixed(1));
    }

    // 9. Sodium & Salt per 100g (in Open Food Facts, sodium is stored in grams, convert to mg)
    let sodium100: number | undefined;
    let salt100: number | undefined;

    const rawSodium = getNutrientVal100g(['sodium_100g', 'sodium_value', 'sodium']);
    const rawSalt = getNutrientVal100g(['salt_100g', 'salt_value', 'salt']);

    if (rawSodium !== undefined) {
      sodium100 = rawSodium < 50 ? Math.round(rawSodium * 1000) : Math.round(rawSodium);
    }
    if (rawSalt !== undefined) {
      salt100 = Number(Number(rawSalt).toFixed(2));
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

    // Check if food is a legitimate zero-calorie item (Water, Diet Soda, Green Tea, Black Coffee)
    const isZeroCalFood =
      nameLower.includes('water') ||
      nameLower.includes('diet') ||
      nameLower.includes('zero') ||
      nameLower.includes('tea') ||
      nameLower.includes('coffee') ||
      nameLower.includes('sugar free');

    let isEstimated = false;
    let estimatedCategory: string | undefined;

    // Apply standard category estimation ONLY if all macros and calories are 0 AND not a zero-calorie food
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

    // Sanitize multi-pack package weights entered as serving sizes
    if (servingGrams && servingGrams > 150) {
      if (
        nameLower.includes('biscuit') ||
        nameLower.includes('cookie') ||
        nameLower.includes('chip') ||
        nameLower.includes('crisp') ||
        nameLower.includes('chocolate') ||
        nameLower.includes('candy') ||
        nameLower.includes('bar')
      ) {
        servingGrams = 30;
        servingSizeStr = '30 g (approx. 1 portion)';
      } else if (nameLower.includes('bread') || nameLower.includes('loaf') || nameLower.includes('toast')) {
        servingGrams = 40;
        servingSizeStr = '40 g (1 slice)';
      } else if (
        nameLower.includes('soda') ||
        nameLower.includes('cola') ||
        nameLower.includes('juice') ||
        nameLower.includes('milk') ||
        nameLower.includes('drink') ||
        nameLower.includes('beverage')
      ) {
        servingGrams = 250;
        servingSizeStr = '250 ml (1 glass)';
      } else if (nameLower.includes('butter') || nameLower.includes('oil') || nameLower.includes('spread')) {
        servingGrams = 15;
        servingSizeStr = '15 g (1 tbsp)';
      }
    }

    // Calculate per serving using manufacturer label values when available, or exact proportional ratio
    let nutrientsServing: ProductNutrients | undefined;
    if (servingGrams && servingGrams > 0) {
      const ratio = servingGrams / 100;

      // Check if manufacturer entered specific serving values
      const servCalRaw = nutriments['energy-kcal_serving'] !== undefined ? Number(nutriments['energy-kcal_serving']) : undefined;
      const servProtRaw = nutriments['proteins_serving'] !== undefined ? Number(nutriments['proteins_serving']) : undefined;
      const servCarbRaw = nutriments['carbohydrates_serving'] !== undefined ? Number(nutriments['carbohydrates_serving']) : undefined;
      const servSugRaw = nutriments['sugars_serving'] !== undefined ? Number(nutriments['sugars_serving']) : undefined;
      const servFatRaw = nutriments['fat_serving'] !== undefined ? Number(nutriments['fat_serving']) : undefined;
      const servSatFatRaw = nutriments['saturated-fat_serving'] !== undefined ? Number(nutriments['saturated-fat_serving']) : undefined;
      const servFibRaw = nutriments['fiber_serving'] !== undefined ? Number(nutriments['fiber_serving']) : undefined;
      const servSodRaw = nutriments['sodium_serving'] !== undefined ? Number(nutriments['sodium_serving']) : undefined;

      // Only use raw serving values if they are realistic (not the entire 500g family box)
      const useRawServing = servCalRaw !== undefined && servCalRaw > 0 && servCalRaw < 1000;

      nutrientsServing = {
        calories: useRawServing && servCalRaw !== undefined ? Math.round(servCalRaw) : Math.round(nutrients100g.calories * ratio),
        protein: useRawServing && servProtRaw !== undefined ? Number(servProtRaw.toFixed(1)) : Number((nutrients100g.protein * ratio).toFixed(1)),
        carbohydrates: useRawServing && servCarbRaw !== undefined ? Number(servCarbRaw.toFixed(1)) : Number((nutrients100g.carbohydrates * ratio).toFixed(1)),
        sugars: useRawServing && servSugRaw !== undefined ? Number(servSugRaw.toFixed(1)) : Number((nutrients100g.sugars * ratio).toFixed(1)),
        addedSugars:
          nutrients100g.addedSugars !== undefined
            ? Number((nutrients100g.addedSugars * ratio).toFixed(1))
            : undefined,
        fat: useRawServing && servFatRaw !== undefined ? Number(servFatRaw.toFixed(1)) : Number((nutrients100g.fat * ratio).toFixed(1)),
        saturatedFat: useRawServing && servSatFatRaw !== undefined ? Number(servSatFatRaw.toFixed(1)) : Number((nutrients100g.saturatedFat * ratio).toFixed(1)),
        fiber: useRawServing && servFibRaw !== undefined ? Number(servFibRaw.toFixed(1)) : Number((nutrients100g.fiber * ratio).toFixed(1)),
        sodium: useRawServing && servSodRaw !== undefined ? (servSodRaw < 50 ? Math.round(servSodRaw * 1000) : Math.round(servSodRaw)) : Math.round(nutrients100g.sodium * ratio),
        salt: Number((nutrients100g.salt * ratio).toFixed(2)),
      };
    }

    // Allergens
    const allergens: string[] = [];
    if (raw.allergens_tags && Array.isArray(raw.allergens_tags)) {
      for (const tag of raw.allergens_tags) {
        const clean = tag.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');
        if (clean) allergens.push(clean.charAt(0).toUpperCase() + clean.slice(1));
      }
    } else if (raw.allergens) {
      allergens.push(...raw.allergens.split(',').map((s: string) => s.trim()).filter(Boolean));
    }

    // Additives
    const additives = (raw.additives_tags || []).map((tag: string) => lookupAdditive(tag));

    // Nova Group
    let novaGroup: 1 | 2 | 3 | 4 | undefined;
    if (raw.nova_group && [1, 2, 3, 4].includes(Number(raw.nova_group))) {
      novaGroup = Number(raw.nova_group) as 1 | 2 | 3 | 4;
    }

    // Nutri-Score
    let nutriScore: 'a' | 'b' | 'c' | 'd' | 'e' | undefined;
    if (raw.nutriscore_grade && ['a', 'b', 'c', 'd', 'e'].includes(raw.nutriscore_grade.toLowerCase())) {
      nutriScore = raw.nutriscore_grade.toLowerCase() as 'a' | 'b' | 'c' | 'd' | 'e';
    }

    // Eco-Score
    let ecoScore: 'a' | 'b' | 'c' | 'd' | 'e' | undefined;
    if (raw.ecoscore_grade && ['a', 'b', 'c', 'd', 'e'].includes(raw.ecoscore_grade.toLowerCase())) {
      ecoScore = raw.ecoscore_grade.toLowerCase() as 'a' | 'b' | 'c' | 'd' | 'e';
    }

    // Clean ingredients text and structured list
    const ingredientsText = (raw.ingredients_text_en || raw.ingredients_text || '').replace(/\s+/g, ' ').trim();
    const ingredientsList: string[] = [];

    if (raw.ingredients && Array.isArray(raw.ingredients) && raw.ingredients.length > 0) {
      for (const ing of raw.ingredients) {
        if (ing.text) {
          ingredientsList.push(ing.text.replace(/^[a-z]{2}:/, '').trim());
        }
      }
    }

    // If ingredients array was empty in Open Food Facts, parse text string
    if (ingredientsList.length === 0 && ingredientsText) {
      const parts = ingredientsText
        .split(/[,;•]\s*(?![^()]*\))/)
        .map((s: string) => s.replace(/^[0-9]+[%\.]\s*/, '').replace(/[\*\[\]_]/g, '').trim())
        .filter((s: string) => s.length > 1 && s.length < 80);
      ingredientsList.push(...parts);
    }

    return {
      barcode,
      name,
      brand,
      image: raw.image_front_url || raw.image_url || raw.image_front_small_url,
      thumbnail: raw.image_front_small_url || raw.image_front_url || raw.image_url,
      servingSize: servingSizeStr,
      servingQuantityGrams: servingGrams,
      nutrients100g,
      nutrientsServing,
      ingredientsText,
      ingredientsList,
      allergens,
      additives,
      novaGroup,
      nutriScore,
      ecoScore,
      categories: raw.categories_tags?.map((c: string) => c.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')) || [],
      labels: raw.labels_tags?.map((l: string) => l.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')) || [],
      source: 'openfoodfacts',
      isComplete: true,
      missingFields,
      isEstimated,
      estimatedCategory,
      lastUpdated: Date.now(),
    };
  },
};
