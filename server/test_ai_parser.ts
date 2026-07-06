import { analyzeFoodInput } from './src/services/nutritionAiService';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    console.log("Analyzing '2 samosa'...");
    const res1 = await analyzeFoodInput('2 samosa');
    console.log(JSON.stringify(res1, null, 2));

    console.log("\nAnalyzing 'Lunch 2 samosa 1 tea 1 banana'...");
    const res2 = await analyzeFoodInput('Lunch 2 samosa 1 tea 1 banana');
    console.log(JSON.stringify(res2, null, 2));

  } catch (error) {
    console.error(error);
  }
}

run();
