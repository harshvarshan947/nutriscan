async function testV2Search() {
  const queries = ['banana', 'lays', 'oreo', 'maggi', 'coca cola'];
  for (const q of queries) {
    const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(q)}&page_size=5&fields=code,product_name,brands,nutriments,image_front_small_url,serving_size,serving_quantity,nova_group,nutriscore_grade`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan/1.0' } });
      const text = await res.text();
      console.log(`[${q}] HTTP ${res.status}, Len: ${text.length}`);
      if (text.startsWith('{')) {
        const json = JSON.parse(text);
        console.log(`  Count: ${json.count}, Products: ${json.products?.length}`);
        if (json.products?.[0]) {
          console.log(`  Sample: "${json.products[0].product_name}" (${json.products[0].brands}) [${json.products[0].code}]`);
        }
      } else {
        console.log(`  Not JSON: ${text.slice(0, 100)}`);
      }
    } catch (e: any) {
      console.log(`[${q}] Error: ${e.message}`);
    }
  }
}

testV2Search();
