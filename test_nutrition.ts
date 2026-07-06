import { parseUserQuantity } from './client/src/utils/nutritionParser.ts';

const testCases = [
  "5 eggs",
  "500g rice",
  "250ml milk",
  "2 bananas",
  "100g chicken breast",
  "2 dosa",
  "3 idli",
  "1 cup oats",
  "250g paneer",
  "500g watermelon"
];

const runTests = async () => {
  console.log("=== NUTRITION SYSTEM PROOF OF CONCEPT ===\n");
  
  // 1. Get Auth Token
  const authRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test_nut@example.com', password: 'password123' })
  });
  
  let token = '';
  if (authRes.ok) {
    const authData = await authRes.json();
    token = authData.token;
  } else {
    // Try login
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_nut@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
  }

  // Clear cache first
  const clearRes = await fetch('http://localhost:5001/api/nutrition/clear-cache', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log("Cache cleared:", await clearRes.text());

  for (const input of testCases) {
    console.log(`--- INPUT: "${input}" ---`);
    const parsed = parseUserQuantity(input);
    console.log(`Parsed: Quantity=${parsed.quantity}, Unit=${parsed.unit}, Food=${parsed.foodName}, Multiplier=${parsed.multiplier}`);
    
    try {
      const res = await fetch(`http://localhost:5001/api/nutrition/search?q=${encodeURIComponent(parsed.foodName)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.foods && data.foods.length > 0) {
        const item = data.foods[0];
        console.log(`Matched Food: ${item.foodName || item.food_name}`);
        console.log(`Base Serving: ${item.baseQuantity} ${item.baseUnit}`);
        console.log(`Base Nutrients: ${item.nutrients?.calories} kcal, ${item.nutrients?.protein}g Pro, ${item.nutrients?.carbs}g Carb, ${item.nutrients?.fat}g Fat`);
        
        console.log(`SCALED NUTRIENTS FOR "${input}":`);
        console.log(`  Calories: ${(item.nutrients?.calories * parsed.multiplier).toFixed(1)} kcal`);
        console.log(`  Protein: ${(item.nutrients?.protein * parsed.multiplier).toFixed(1)}g`);
        console.log(`  Carbs: ${(item.nutrients?.carbs * parsed.multiplier).toFixed(1)}g`);
        console.log(`  Fat: ${(item.nutrients?.fat * parsed.multiplier).toFixed(1)}g\n`);
      } else {
        console.log("No foods found.\n");
      }
    } catch (e) {
      console.error("API Error", e);
    }
  }
};

runTests();
