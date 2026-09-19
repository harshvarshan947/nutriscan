async function testQueries() {
  const queries = ['Lays', 'Oreo', 'Maggi', 'Coca Cola', 'Amul', 'Nutella', 'Doritos', 'Cheerios', 'Quaker'];

  for (const q of queries) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan - Testing' } });
      const data = await res.json();
      console.log(`\nQuery: "${q}" -> Found ${data.count || data.products?.length || 0} products`);
      if (data.products && data.products.length > 0) {
        const p = data.products[0];
        console.log(`  Sample: "${p.product_name || p.product_name_en}" by "${p.brands}"`);
        console.log(`  Nutriments keys count: ${Object.keys(p.nutriments || {}).length}`);
        console.log(`  Energy kcal: 100g=${p.nutriments?.['energy-kcal_100g']}, kcal=${p.nutriments?.['energy-kcal']}, 100g_energy=${p.nutriments?.['energy_100g']}, serving=${p.nutriments?.['energy-kcal_serving']}`);
        console.log(`  Proteins: 100g=${p.nutriments?.['proteins_100g']}, val=${p.nutriments?.['proteins_value']}, serving=${p.nutriments?.['proteins_serving']}`);
        console.log(`  Carbs: 100g=${p.nutriments?.['carbohydrates_100g']}, val=${p.nutriments?.['carbohydrates_value']}, serving=${p.nutriments?.['carbohydrates_serving']}`);
        console.log(`  Sugars: 100g=${p.nutriments?.['sugars_100g']}, val=${p.nutriments?.['sugars_value']}, serving=${p.nutriments?.['sugars_serving']}`);
        console.log(`  Fat: 100g=${p.nutriments?.['fat_100g']}, val=${p.nutriments?.['fat_value']}, serving=${p.nutriments?.['fat_serving']}`);
        console.log(`  Serving size: "${p.serving_size}", quantity: ${p.serving_quantity}`);
      }
    } catch (e) {
      console.error(`Error querying "${q}":`, e);
    }
  }
}

testQueries();
