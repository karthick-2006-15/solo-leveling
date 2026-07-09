import { gatherUserContext } from './ariaContextService';
import { generateAriaResponse } from './ariaPromptService';

export const generateDailySchedule = async (userId: string) => {
  const context = await gatherUserContext(userId);
  
  const prompt = `
  Generate an optimal daily schedule block for the Hunter.
  Distribute their daily missions, study blocks, and workouts based on their recovery score and rank.
  
  Hunter Context:
  ${JSON.stringify(context, null, 2)}
  
  Return a JSON array of schedule blocks:
  [
    {
      "timeRange": "08:00 AM - 09:00 AM",
      "activity": "String",
      "focus": "String"
    }
  ]
  `;
  
  try {
    const aiResponse = await generateAriaResponse(userId, prompt);
    const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Scheduler Error', error);
    return [];
  }
};
