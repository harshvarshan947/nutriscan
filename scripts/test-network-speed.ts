async function testEndpoints() {
  const tests = [
    'https://world.openfoodfacts.org/api/v2/product/7394376616038.json',
    'https://world.openfoodfacts.org/api/v0/product/7394376616038.json',
    'https://world.openfoodfacts.org/api/v2/search?categories_tags_en=snacks&page_size=5',
    'https://world.openfoodfacts.org/cgi/search.pl?search_terms=banana&json=1&page_size=5',
    'https://in.openfoodfacts.org/cgi/search.pl?search_terms=banana&json=1&page_size=5',
    'https://world.openfoodfacts.net/cgi/search.pl?search_terms=banana&json=1&page_size=5',
  ];

  for (const url of tests) {
    const start = Date.now();
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 6000);
      const res = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'NutriScan-Diagnostics/1.0' } });
      clearTimeout(t);
      const text = await res.text();
      const elapsed = Date.now() - start;
      const isJson = text.trim().startsWith('{') || text.trim().startsWith('[');
      console.log(`[${elapsed}ms] ${res.status} JSON:${isJson} (${text.length} chars) -> ${url}`);
    } catch (e: any) {
      const elapsed = Date.now() - start;
      console.log(`[${elapsed}ms] FAILED (${e.message}) -> ${url}`);
    }
  }
}

testEndpoints();
