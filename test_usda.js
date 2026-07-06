const test = async () => {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=eggs&api_key=DEMO_KEY&pageSize=20`;
  const response = await fetch(url);
  const data = await response.json();
  data.foods.forEach(f => {
    console.log(`- ${f.description} [${f.dataType}] (ID: ${f.fdcId})`);
  });
};
test();
