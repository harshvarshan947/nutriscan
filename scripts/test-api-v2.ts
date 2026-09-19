async function testApiV2() {
  const queries = ['Lays', 'Oreo', 'Maggi', 'Coca Cola', 'Amul', 'Nutella', 'Doritos', 'Cheerios', 'Quaker'];

  for (const q of queries) {
    // Open Food Facts API v2 Search endpoint
    const urlV2 = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(q)}&fields=code,product_name,product_name_en,brands,brands_tags,nutriments,image_front_small_url,image_url,serving_size,serving_quantity,nova_group,nutriscore_grade,ecoscore_grade,ingredients_text,ingredients_text_en,allergens_tags,additives_tags&page_size=5`;

    try {
      const res = await fetch(urlV2, {
        headers: {
          'User-Agent': 'NutriScan - WebApp - Version 1.0 (contact@nutriscan.app)',
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      console.log(`\nQuery API v2: "${q}" -> Status: ${data.status || 'ok'}, Count: ${data.count || data.products?.length || 0}`);
      if (data.products && data.products.length > 0) {
        const p = data.products[0];
        console.log(`  Code: ${p.code}`);
        console.log(`  Name: "${p.product_name || p.product_name_en}" by "${p.brands}"`);
        console.log(`  Nutriments:`, JSON.stringify(p.nutriments || {}).slice(0, 150));
      }
    } catch (e) {
      console.error(`Error with API v2 on "${q}":`, e);
    }
  }
}

testApiV2();
