import { parseUserQuantity } from './client/src/utils/nutritionParser.ts';

const tests = [
  '500g rice',
  '2 eggs',
  '1 banana',
  '250ml milk',
  '100g chicken breast',
  '1 dosa',
  '2 idli',
  '1 cup oats',
  '250g paneer',
  '500g watermelon',
  'rice'
];

tests.forEach(t => {
  console.log(`"${t}" =>`, parseUserQuantity(t));
});
