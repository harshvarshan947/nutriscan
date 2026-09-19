async function testReliableSearch() {
  const queries = ['doritos', 'cheetos', 'lays', 'maggi', 'coca cola', 'pepsi', 'kitkat', 'pringles', 'apple', 'bread'];
  
  for (const q of queries) {
    const url = `https://world.openfoodfacts.net/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5`;
    const start = Date.now();
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan-Diagnostics/1.0' } });
      const data = await res.json();
      console.log(`[${Date.now() - start}ms] "${q}" -> Found ${data.count} items, returned ${data.products?.length}`);
      if (data.products?.[0]) {
        const p = data.products[0];
        console.log(`   Top: "${p.product_name}" (${p.brands}) - Barcode: ${p.code}`);
      }
    } catch (e: any) {
      console.log(`[${Date.now() - start}ms] "${q}" -> FAILED: ${e.message}`);
    }
  }
}

testReliableSearch();
