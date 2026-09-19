import { productService } from '../src/services/productService';

async function testFullPipeline() {
  console.log('=== TEST 1: Barcode Lookups ===');
  const barcodes = [
    '3017620422003', // Nutella
    '5449000000996', // Coca-Cola
    '5000159461122', // Snickers
    '5053990156009', // Pringles
    '8445290728791', // KitKat Cereal
  ];

  for (const b of barcodes) {
    const start = Date.now();
    const p = await productService.getProduct(b);
    const elapsed = Date.now() - start;
    if (p) {
      console.log(`[${elapsed}ms] FOUND: "${p.name}" (${p.brand})`);
      console.log(`  100g: ${p.nutrients100g.calories} kcal | ${p.nutrients100g.protein}g P | ${p.nutrients100g.carbohydrates}g C | ${p.nutrients100g.sugars}g Sugar | ${p.nutrients100g.fat}g F | ${p.nutrients100g.sodium}mg Sodium`);
      if (p.nutrientsServing) {
        console.log(`  Serving (${p.servingSize}): ${p.nutrientsServing.calories} kcal | ${p.nutrientsServing.protein}g P | ${p.nutrientsServing.carbohydrates}g C | ${p.nutrientsServing.sugars}g Sugar | ${p.nutrientsServing.fat}g F | ${p.nutrientsServing.sodium}mg Sodium`);
      }
      console.log(`  Ingredients (${p.ingredientsList?.length || 0}): ${p.ingredientsList?.slice(0, 3).join(', ')}`);
    } else {
      console.log(`[${elapsed}ms] NOT FOUND: ${b}`);
    }
  }

  console.log('\n=== TEST 2: Real-time Live Searches ===');
  const searchTerms = ['lays', 'maggi', 'amul', 'oreo', 'yogurt'];
  for (const q of searchTerms) {
    const start = Date.now();
    const list = await productService.searchProducts(q);
    const elapsed = Date.now() - start;
    console.log(`[${elapsed}ms] "${q}" -> Found ${list.length} results`);
    if (list[0]) {
      console.log(`  Top match: "${list[0].name}" (${list[0].brand}) - ${list[0].nutrients100g.calories} kcal [Barcode: ${list[0].barcode}]`);
    }
  }
}

testFullPipeline();
