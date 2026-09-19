async function testFormats() {
  const urls = [
    'https://world.openfoodfacts.org/cgi/search.pl?search_terms=Lays&search_simple=1&action=process&json=1',
    'https://en.openfoodfacts.org/cgi/search.pl?search_terms=Lays&search_simple=1&action=process&json=1',
    'https://us.openfoodfacts.org/cgi/search.pl?search_terms=Lays&search_simple=1&action=process&json=1',
    'https://in.openfoodfacts.org/cgi/search.pl?search_terms=Lays&search_simple=1&action=process&json=1',
    'https://world.openfoodfacts.org/cgi/search.pl?search_terms=Lays&json=1',
    'https://world.openfoodfacts.net/cgi/search.pl?search_terms=Lays&search_simple=1&action=process&json=1',
    'https://world.openfoodfacts.org/api/v2/product/0028400070560.json',
    'https://world.openfoodfacts.org/api/v0/product/0028400070560.json',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'NutriScan - Testing/1.0 (contact@nutriscan.app)',
          'Accept': 'application/json',
        },
      });
      const text = await res.text();
      const isJson = text.trim().startsWith('{') || text.trim().startsWith('[');
      console.log(`URL: ${url}`);
      console.log(`  HTTP ${res.status}, Content-Type: ${res.headers.get('content-type')}, IsJSON: ${isJson}, Length: ${text.length}`);
      if (isJson) {
        const parsed = JSON.parse(text);
        console.log(`  Count/Status: ${parsed.count || parsed.status}, Products: ${parsed.products?.length || (parsed.product ? 1 : 0)}`);
      } else {
        console.log(`  First 100 chars: ${text.slice(0, 100)}...`);
      }
    } catch (e: any) {
      console.log(`URL: ${url} ERROR: ${e.message}`);
    }
  }
}

testFormats();
