async function inspectRaw() {
  const url = 'https://world.openfoodfacts.org/api/v2/product/8585002484093.json';
  const res = await fetch(url, { headers: { 'User-Agent': 'NutriScan - Test' } });
  const data = await res.json();
  console.log('Product Name:', data.product?.product_name);
  console.log('Nutriments object:');
  console.log(JSON.stringify(data.product?.nutriments, null, 2));
}

inspectRaw();
