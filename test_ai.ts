import { analyzeFoodInput } from './server/src/services/nutritionAiService';
(async () => {
  try {
    const r = await analyzeFoodInput('2 bananas');
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
