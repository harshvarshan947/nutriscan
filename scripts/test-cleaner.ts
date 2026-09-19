import { lookupAdditive } from '../src/data/additiveDirectory';

export function cleanProductName(raw: Record<string, any>): string {
  const candidates = [
    raw.product_name_en,
    raw.product_name,
    raw.generic_name_en,
    raw.generic_name,
  ].filter(Boolean);

  let chosen = candidates[0] || 'Packaged Product';
  // Clean multiple spaces and whitespace
  chosen = chosen.replace(/\s+/g, ' ').trim();
  return chosen;
}

export function cleanBrandName(raw: Record<string, any>): string {
  let brand = raw.brands || raw.brand_owner || raw.brands_tags?.[0] || 'Unknown Brand';
  if (brand.includes(',')) {
    brand = brand.split(',')[0].trim();
  }
  return brand.replace(/^[a-z]{2}:/, '').replace(/\s+/g, ' ').trim();
}

export function parseIngredientsList(raw: Record<string, any>): { text: string; list: string[] } {
  const text = (raw.ingredients_text_en || raw.ingredients_text || '').replace(/\s+/g, ' ').trim();
  const list: string[] = [];

  if (raw.ingredients && Array.isArray(raw.ingredients) && raw.ingredients.length > 0) {
    for (const ing of raw.ingredients) {
      if (ing.text) {
        list.push(ing.text.replace(/^[a-z]{2}:/, '').trim());
      }
    }
  }

  // If array was empty, parse from text
  if (list.length === 0 && text) {
    const parts = text
      .split(/[,;•]\s*(?![^()]*\))/)
      .map((s) => s.replace(/^[0-9]+[%\.]\s*/, '').replace(/[\*\[\]_]/g, '').trim())
      .filter((s) => s.length > 1 && s.length < 80);
    list.push(...parts);
  }

  return { text, list };
}

async function testCleaner() {
  const testCodes = ['3168930173311', '5053990156009', '8445290728791', '5449000054227', '3033710084913'];
  for (const c of testCodes) {
    const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${c}.json`);
    const json = await res.json();
    const p = json.product;
    const name = cleanProductName(p);
    const brand = cleanBrandName(p);
    const { text, list } = parseIngredientsList(p);
    console.log(`\nProduct: "${name}" by "${brand}"`);
    console.log(`  Ingredients found: ${list.length} items`);
    if (list.length > 0) {
      console.log(`  Sample ingredients: ${list.slice(0, 4).join(' | ')}`);
    }
  }
}

testCleaner();
