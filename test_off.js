const test = async () => {
  const url = `https://world.openfoodfacts.org/api/v2/search?categories_tags=eggs&fields=product_name,nutriments,image_url,serving_size`;
  const response = await fetch(url, { headers: { 'User-Agent': 'my-habit-app (contact@example.com)' } });
  console.log(`Status:`, response.status, response.statusText);
  const text = await response.text();
  console.log(text.substring(0, 200));
};
test();
