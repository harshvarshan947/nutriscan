import { productService } from '../src/services/productService';

async function testFinalVerification() {
  console.log('=== TEST 1: Empty Online Record Benchmark Estimation ===');
  const emptyOffRecord = {
    code: '9999999999999',
    product_name: 'Local Potato Chips Classic',
    brands: 'Snack Master',
    categories_tags: ['en:chips-and-fries', 'en:potato-crisps'],
    nutriments: {}, // completely empty from crowdsourced contributor
  };

  const normalized = productService.normalizeOffProduct(emptyOffRecord.code, emptyOffRecord);
  console.log('Result for empty record:', normalized.name);
  console.log('  Is Estimated:', normalized.isEstimated);
  console.log('  Category:', normalized.estimatedCategory);
  console.log('  Calories:', normalized.nutrients100g.calories, 'kcal');
  console.log('  Protein:', normalized.nutrients100g.protein, 'g');
  console.log('  Fat:', normalized.nutrients100g.fat, 'g');
  console.log('  Carbs:', normalized.nutrients100g.carbohydrates, 'g');
  console.log('  Sodium:', normalized.nutrients100g.sodium, 'mg');

  console.log('\n=== TEST 2: Common Unpackaged & Staple Foods Search ===');
  const testSearches = ['Banana', 'Egg', 'Apple', 'Chicken', 'Paneer', 'Rice', 'Almonds', 'Roti'];
  for (const query of testSearches) {
    const results = await productService.searchProducts(query);
    console.log(`Query "${query}" -> Found ${results.length} items`);
    if (results.length > 0) {
      const top = results[0];
      console.log(`  Top match: "${top.name}" (${top.brand}) - ${top.nutrients100g.calories} kcal, ${top.nutrients100g.protein}g protein, ${top.nutrients100g.fat}g fat`);
    }
  }
}

testFinalVerification();
