import { gatherUserContext } from './ariaContextService';
import { generateAriaResponse } from './ariaPromptService';

/**
 * ariaDecisionEngine
 * Orchestrates the next best action for the Hunter.
 */
export const getNextBestAction = async (userId: string) => {
  const context = await gatherUserContext(userId);
  
  const prompt = `
  You are the AI Decision Engine. Analyze the Hunter's current state.
  Determine the SINGLE best action the Hunter should take right now.
  Consider energy levels, time of day, pending missions, and burnout risk.

  Hunter Context:
  ${JSON.stringify(context, null, 2)}
  
  Return a JSON object:
  {
    "action": "String (Short Title)",
    "reasoning": "String (Why this is the best action)",
    "urgency": "HIGH | MEDIUM | LOW"
  }
  `;
  
  try {
    const aiResponse = await generateAriaResponse(userId, prompt);
    const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Decision Engine Error', error);
    return {
      action: 'Rest and Recover',
      reasoning: 'System could not determine next action, defaulting to safety.',
      urgency: 'LOW'
    };
  }
};
