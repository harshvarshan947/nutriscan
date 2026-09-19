async function inspectNutriments() {
  const codes = [
    '3168930173311', // Doritos
    '5053990156009', // Pringles
    '8445290728791', // KitKat Cereal
    '5449000054227', // Coca-Cola
    '3033710084913', // Maggi
  ];

  for (const c of codes) {
    const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${c}.json`, {
      headers: { 'User-Agent': 'NutriScan-Diagnostics/1.0' }
    });
    const json = await res.json();
    const p = json.product;
    if (!p) {
      console.log(`Product ${c} not found`);
      continue;
    }

    console.log('\n======================================================');
    console.log(`Product: "${p.product_name}" | Brand: "${p.brands}" [${c}]`);
    console.log(`Serving size: "${p.serving_size}" | serving_quantity: ${p.serving_quantity} | serving_quantity_unit: ${p.serving_quantity_unit}`);
    console.log('--- 100g Nutriments ---');
    console.log(`  energy-kcal_100g: ${p.nutriments['energy-kcal_100g']}`);
    console.log(`  energy_100g: ${p.nutriments['energy_100g']} (${p.nutriments['energy_unit']})`);
    console.log(`  proteins_100g: ${p.nutriments['proteins_100g']}`);
    console.log(`  carbohydrates_100g: ${p.nutriments['carbohydrates_100g']}`);
    console.log(`  sugars_100g: ${p.nutriments['sugars_100g']}`);
    console.log(`  fat_100g: ${p.nutriments['fat_100g']}`);
    console.log(`  saturated-fat_100g: ${p.nutriments['saturated-fat_100g']}`);
    console.log(`  fiber_100g: ${p.nutriments['fiber_100g']}`);
    console.log(`  sodium_100g: ${p.nutriments['sodium_100g']} | salt_100g: ${p.nutriments['salt_100g']}`);
    console.log('--- Serving Nutriments ---');
    console.log(`  energy-kcal_serving: ${p.nutriments['energy-kcal_serving']}`);
    console.log(`  proteins_serving: ${p.nutriments['proteins_serving']}`);
    console.log(`  carbohydrates_serving: ${p.nutriments['carbohydrates_serving']}`);
    console.log(`  sugars_serving: ${p.nutriments['sugars_serving']}`);
    console.log(`  fat_serving: ${p.nutriments['fat_serving']}`);
    console.log(`  saturated-fat_serving: ${p.nutriments['saturated-fat_serving']}`);
    console.log(`  fiber_serving: ${p.nutriments['fiber_serving']}`);
    console.log(`  sodium_serving: ${p.nutriments['sodium_serving']} | salt_serving: ${p.nutriments['salt_serving']}`);
  }
}

inspectNutriments();
