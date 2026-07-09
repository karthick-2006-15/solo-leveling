import AriaPlan from '../models/AriaPlan';
import { generateAriaResponse } from './ariaPromptService';
import { gatherUserContext } from './ariaContextService';
import mongoose from 'mongoose';

export const generatePlan = async (userId: string, planType: string, goal: string) => {
  const context = await gatherUserContext(userId);
  
  const prompt = `
  Generate a step-by-step roadmap for the Hunter.
  Goal: ${goal}
  Plan Type: ${planType}
  
  Hunter Context:
  ${JSON.stringify(context, null, 2)}
  
  Return a JSON object:
  {
    "title": "String",
    "milestones": [
      {
        "title": "String",
        "description": "String",
        "dueDate": "ISO Date String (optional)"
      }
    ]
  }
  `;
  
  try {
    const aiResponse = await generateAriaResponse(userId, prompt);
    const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const planData = JSON.parse(jsonStr);

    const plan = await AriaPlan.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: planData.title || goal,
      type: planType,
      status: 'ACTIVE',
      milestones: planData.milestones || [],
      generatedBy: 'ARIA'
    });
    
    return plan;
  } catch (error) {
    console.error('Error generating plan', error);
    throw new Error('Failed to generate plan', { cause: error });
  }
};

export const getActivePlans = async (userId: string) => {
  return await AriaPlan.find({ userId, status: 'ACTIVE' }).sort({ createdAt: -1 });
};
