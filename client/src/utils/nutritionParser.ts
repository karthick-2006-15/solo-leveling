export interface ParsedFood {
  foodName: string;
  quantity: number;
  unit: string;
  multiplier: number;
}

const unitMap: Record<string, { type: 'mass' | 'volume' | 'count', factorToGramOrMl: number }> = {
  // Mass
  'g': { type: 'mass', factorToGramOrMl: 1 },
  'gram': { type: 'mass', factorToGramOrMl: 1 },
  'grams': { type: 'mass', factorToGramOrMl: 1 },
  'kg': { type: 'mass', factorToGramOrMl: 1000 },
  'kilo': { type: 'mass', factorToGramOrMl: 1000 },
  'lb': { type: 'mass', factorToGramOrMl: 453.592 },
  'lbs': { type: 'mass', factorToGramOrMl: 453.592 },
  'oz': { type: 'mass', factorToGramOrMl: 28.3495 },
  
  // Volume
  'ml': { type: 'volume', factorToGramOrMl: 1 },
  'milliliter': { type: 'volume', factorToGramOrMl: 1 },
  'l': { type: 'volume', factorToGramOrMl: 1000 },
  'liter': { type: 'volume', factorToGramOrMl: 1000 },
  'cup': { type: 'volume', factorToGramOrMl: 240 },
  'cups': { type: 'volume', factorToGramOrMl: 240 },
  'tbsp': { type: 'volume', factorToGramOrMl: 15 },
  'tsp': { type: 'volume', factorToGramOrMl: 5 },
  'tablespoon': { type: 'volume', factorToGramOrMl: 15 },
  'teaspoon': { type: 'volume', factorToGramOrMl: 5 },
  
  // Counts (approximate average weight in grams for general items if unit conversion is needed)
  'serving': { type: 'count', factorToGramOrMl: 100 },
  'piece': { type: 'count', factorToGramOrMl: 100 },
  'pieces': { type: 'count', factorToGramOrMl: 100 },
  'slice': { type: 'count', factorToGramOrMl: 30 },
  'slices': { type: 'count', factorToGramOrMl: 30 },
  'bowl': { type: 'count', factorToGramOrMl: 250 },
  'plate': { type: 'count', factorToGramOrMl: 400 },
  
  // Specific Indian/Custom counts
  'dosa': { type: 'count', factorToGramOrMl: 120 },
  'idli': { type: 'count', factorToGramOrMl: 50 },
  'roti': { type: 'count', factorToGramOrMl: 40 },
  'chapati': { type: 'count', factorToGramOrMl: 40 },
  'egg': { type: 'count', factorToGramOrMl: 50 },
  'eggs': { type: 'count', factorToGramOrMl: 50 },
  'banana': { type: 'count', factorToGramOrMl: 118 },
  'bananas': { type: 'count', factorToGramOrMl: 118 },
  'apple': { type: 'count', factorToGramOrMl: 182 },
  'apples': { type: 'count', factorToGramOrMl: 182 },
};

const typoMap: Record<string, string> = {
  'chiken': 'chicken',
  'chikken': 'chicken',
  'bananna': 'banana',
  'banna': 'banana',
  'ricee': 'rice',
  'eggg': 'egg',
  'eggss': 'eggs',
  'eg': 'egg'
};

export const parseUserQuantity = (input: string): ParsedFood => {
  const normalized = input.trim().toLowerCase();
  
  // Regex to match "500g rice", "2.5 cups of milk", "1 dosa"
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s*(?:of\s+)?(.*)$/);
  
  if (match) {
    const qty = parseFloat(match[1]);
    let unit = match[2];
    let foodName = match[3];

    // If unit is missing but the rest is the food (e.g. "2 eggs")
    if (!unit && foodName) {
      // It's possible the regex matched "2" as qty, unit undefined, foodName "eggs".
      // Let's check if the first word of foodName is a unit
      const parts = foodName.split(' ');
      if (unitMap[parts[0]]) {
        unit = parts[0];
        foodName = parts.slice(1).join(' ');
      } else {
        unit = 'piece'; // default fallback
      }
    } else if (unit && !foodName) {
      // E.g., user just typed "2 apple", regex captures "2" as qty, "apple" as unit, foodName empty.
      foodName = unit;
      // If the food name is also a known unit (like "2 bananas"), we can use it directly
      if (!unitMap[unit]) {
        unit = 'piece';
      }
    }

    // Fix typos in food name
    if (foodName) {
      foodName = foodName.split(' ').map(word => typoMap[word] || word).join(' ');
    }

    // Attempt to standardize unit
    if (unit && unitMap[unit]) {
      const mapping = unitMap[unit];
      // Since OpenFoodFacts provides data per 100g/ml
      // Multiplier is (Qty * factor) / 100
      const multiplier = (qty * mapping.factorToGramOrMl) / 100;
      return {
        foodName: foodName || unit, // fallback if empty
        quantity: qty,
        unit,
        multiplier
      };
    } else if (unit) {
      // Unknown unit, treat it as part of food name
      foodName = `${unit} ${foodName}`.trim();
      // Assume it's a generic "count" item ~100g
      return {
        foodName,
        quantity: qty,
        unit: 'piece',
        multiplier: (qty * 100) / 100
      };
    }
  }
  
  // Fallback if no quantity matched (e.g. user just types "rice")
  return {
    foodName: normalized,
    quantity: 100,
    unit: 'g',
    multiplier: 1
  };
};
