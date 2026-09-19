async function inspectRealOFFProducts() {
  const codes = [
    '7394376616038', // Oatly
    '3017620422003', // Nutella
    '7622210449283', // Oreo
    '5449000000996', // Coca Cola
    '8901058863673', // Maggi
    '0028400070560', // Lays
    '8410076472093', // Fage Yogurt
    '5000159461122', // Snickers
  ];

  for (const c of codes) {
    const url = `https://world.openfoodfacts.org/api/v2/product/${c}.json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan - Test' } });
    const data = await res.json();
    const p = data.product;
    if (!p) {
      console.log(`Product ${c} not found`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`Product: "${p.product_name}" (${p.brands}) [${c}]`);
    console.log(`Serving size string: "${p.serving_size}", Serving quantity: ${p.serving_quantity}`);
    console.log(`Nutriments 100g:`);
    console.log(`  energy-kcal_100g: ${p.nutriments['energy-kcal_100g']}, energy_100g: ${p.nutriments['energy_100g']} (unit: ${p.nutriments['energy_unit']})`);
    console.log(`  proteins_100g: ${p.nutriments['proteins_100g']}`);
    console.log(`  carbohydrates_100g: ${p.nutriments['carbohydrates_100g']}`);
    console.log(`  sugars_100g: ${p.nutriments['sugars_100g']}`);
    console.log(`  fat_100g: ${p.nutriments['fat_100g']}`);
    console.log(`  saturated-fat_100g: ${p.nutriments['saturated-fat_100g']}`);
    console.log(`  fiber_100g: ${p.nutriments['fiber_100g']}`);
    console.log(`  sodium_100g: ${p.nutriments['sodium_100g']}, salt_100g: ${p.nutriments['salt_100g']}`);

    console.log(`Nutriments Serving:`);
    console.log(`  energy-kcal_serving: ${p.nutriments['energy-kcal_serving']}, energy_serving: ${p.nutriments['energy_serving']}`);
    console.log(`  proteins_serving: ${p.nutriments['proteins_serving']}`);
    console.log(`  carbohydrates_serving: ${p.nutriments['carbohydrates_serving']}`);
    console.log(`  sugars_serving: ${p.nutriments['sugars_serving']}`);
    console.log(`  fat_serving: ${p.nutriments['fat_serving']}`);
    console.log(`  saturated-fat_serving: ${p.nutriments['saturated-fat_serving']}`);
    console.log(`  fiber_serving: ${p.nutriments['fiber_serving']}`);
    console.log(`  sodium_serving: ${p.nutriments['sodium_serving']}, salt_serving: ${p.nutriments['salt_serving']}`);
  }
}

inspectRealOFFProducts();
