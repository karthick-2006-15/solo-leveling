const fs = require('fs');
const test = async () => {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=eggs&api_key=DEMO_KEY&pageSize=10`;
  const response = await fetch(url);
  const data = await response.json();
  const summary = data.foods.map(f => ({
    fdcId: f.fdcId,
    description: f.description,
    dataType: f.dataType,
    foodCategory: f.foodCategory,
    brandOwner: f.brandOwner,
    calories: f.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0
  }));
  fs.writeFileSync('usda_eggs_summary.json', JSON.stringify(summary, null, 2));
  console.log("Saved summary.");
};
test();
