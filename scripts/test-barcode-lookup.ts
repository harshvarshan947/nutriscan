async function testBarcodes() {
  const codes = [
    '7394376616038',
    '8901058863673',
    '8410076472093',
    '0028400070560',
    '028400070560',
    '3017620422003',
    '5449000000996',
    '5000159461122',
  ];

  const endpoints = [
    (c: string) => `https://world.openfoodfacts.org/api/v0/product/${c}.json`,
    (c: string) => `https://world.openfoodfacts.org/api/v2/product/${c}.json`,
    (c: string) => `https://in.openfoodfacts.org/api/v0/product/${c}.json`,
    (c: string) => `https://in.openfoodfacts.org/api/v2/product/${c}.json`,
    (c: string) => `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${c}&json=1`,
  ];

  for (const c of codes) {
    console.log(`\nTesting barcode: "${c}"`);
    let found = false;
    for (let i = 0; i < endpoints.length; i++) {
      const url = endpoints[i](c);
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan - Test' } });
        if (res.ok) {
          const data = await res.json();
          const p = data.product || (data.products && data.products[0]);
          if (p && (p.product_name || p.product_name_en)) {
            console.log(`  [Endpoint ${i}] SUCCESS: "${p.product_name || p.product_name_en}" by "${p.brands}" (via ${url})`);
            found = true;
            break;
          }
        }
      } catch (e: any) {
        // continue
      }
    }
    if (!found) {
      console.log(`  NOT FOUND on any endpoint for "${c}"`);
    }
  }
}

testBarcodes();
