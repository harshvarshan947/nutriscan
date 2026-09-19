import { productService } from '../src/services/productService';

async function testNutrientParser() {
  const mirrors = ['https://in.openfoodfacts.org', 'https://world.openfoodfacts.org', 'https://world.openfoodfacts.net'];
  const testTerms = ['Lays', 'Oreo', 'Maggi', 'Coca Cola', 'Amul Butter', 'Nutella', 'Doritos', 'Cheerios', 'Quaker Oats', 'KitKat'];

  for (const term of testTerms) {
    console.log(`\n========================================`);
    console.log(`Searching for "${term}"...`);

    let products: any[] = [];
    for (const mirror of mirrors) {
      try {
        const url = `${mirror}/cgi/search.pl?search_terms=${encodeURIComponent(term)}&json=1&page_size=3`;
        const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan - Test' } });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('json')) {
            const data = await res.json();
            if (data.products && data.products.length > 0) {
              products = data.products;
              console.log(`Found ${data.products.length} products on ${mirror}`);
              break;
            }
          }
        }
      } catch (e) {
        // continue
      }
    }

    for (const raw of products.slice(0, 2)) {
      const parsed = productService.normalizeOffProduct(raw.code || '0000', raw);
      console.log(`\nProduct: "${parsed.name}" (${parsed.brand}) [Barcode: ${parsed.barcode}]`);
      console.log(`  Serving size: "${parsed.servingSize}" (${parsed.servingQuantityGrams}g)`);
      console.log(`  Nutrients (100g): Calories=${parsed.nutrients100g.calories} kcal, Protein=${parsed.nutrients100g.protein}g, Carbs=${parsed.nutrients100g.carbohydrates}g, Sugars=${parsed.nutrients100g.sugars}g, Fat=${parsed.nutrients100g.fat}g, SatFat=${parsed.nutrients100g.saturatedFat}g, Fiber=${parsed.nutrients100g.fiber}g, Sodium=${parsed.nutrients100g.sodium}mg, Salt=${parsed.nutrients100g.salt}g`);
      if (parsed.nutrientsServing) {
        console.log(`  Nutrients (Serving): Calories=${parsed.nutrientsServing.calories} kcal, Protein=${parsed.nutrientsServing.protein}g, Carbs=${parsed.nutrientsServing.carbohydrates}g, Sugars=${parsed.nutrientsServing.sugars}g, Fat=${parsed.nutrientsServing.fat}g, SatFat=${parsed.nutrientsServing.saturatedFat}g, Fiber=${parsed.nutrientsServing.fiber}g, Sodium=${parsed.nutrientsServing.sodium}mg`);
      }
    }
  }
}

testNutrientParser();
