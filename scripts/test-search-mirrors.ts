async function testSearchMirrors() {
  const mirrors = [
    'https://world.openfoodfacts.net',
    'https://en.openfoodfacts.org',
    'https://world.openfoodfacts.org',
    'https://in.openfoodfacts.org',
  ];

  for (const m of mirrors) {
    const url = `${m}/cgi/search.pl?search_terms=oreo&search_simple=1&action=process&json=1&page_size=3`;
    const start = Date.now();
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 5000);
      const res = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'NutriScan/1.0' } });
      clearTimeout(t);
      const text = await res.text();
      const elapsed = Date.now() - start;
      const isJson = text.startsWith('{');
      console.log(`[${elapsed}ms] ${m} -> HTTP ${res.status}, isJson: ${isJson}, len: ${text.length}`);
      if (isJson) {
        const j = JSON.parse(text);
        console.log(`   Sample product: "${j.products?.[0]?.product_name}"`);
      }
    } catch (e: any) {
      console.log(`[${Date.now() - start}ms] ${m} -> ERROR: ${e.message}`);
    }
  }
}

testSearchMirrors();
