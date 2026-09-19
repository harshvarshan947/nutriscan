async function testMirrors() {
  const mirrors = [
    'https://in.openfoodfacts.org',
    'https://world.openfoodfacts.org',
    'https://world.openfoodfacts.net',
    'https://us.openfoodfacts.org',
    'https://uk.openfoodfacts.org',
  ];

  const queries = ['Lays', 'Oreo', 'Maggi', 'Nutella', 'Amul', 'Quaker'];

  for (const q of queries) {
    console.log(`\n--- Testing Query: "${q}" ---`);
    let found = false;
    for (const mirror of mirrors) {
      const url = `${mirror}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10`;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan - Testing' } });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('json')) {
            const data = await res.json();
            console.log(`  [${mirror}] Success! HTTP ${res.status}, Found: ${data.products?.length || 0} products`);
            if (data.products?.length > 0) {
              const sample = data.products[0];
              console.log(`    Sample: "${sample.product_name || sample.product_name_en}" by "${sample.brands}" (Code: ${sample.code})`);
              console.log(`    Calories: ${sample.nutriments?.['energy-kcal_100g'] || sample.nutriments?.['energy-kcal'] || sample.nutriments?.['energy_100g']}, Protein: ${sample.nutriments?.['proteins_100g']}, Sugars: ${sample.nutriments?.['sugars_100g']}, Sodium: ${sample.nutriments?.['sodium_100g'] || sample.nutriments?.['salt_100g']}`);
              found = true;
              break;
            }
          }
        }
      } catch (e: any) {
        // continue
      }
    }
    if (!found) {
      console.log(`  No mirror returned valid JSON for "${q}"`);
    }
  }
}

testMirrors();
