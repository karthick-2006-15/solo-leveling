import AriaPrediction from '../models/AriaPrediction';
import { generateAriaResponse } from './ariaPromptService';
import { gatherUserContext } from './ariaContextService';
import mongoose from 'mongoose';

export const generatePredictions = async (userId: string) => {
  const context = await gatherUserContext(userId);
  
  const prompt = `
  Analyze the following Hunter context and generate predictive insights.
  Return a JSON array of predictions. Each prediction MUST have:
  - type: one of ["BURNOUT_RISK", "XP_GROWTH", "RANK_PROJECTION", "HABIT_FAILURE_RISK", "PERFORMANCE_TREND"]
  - confidenceScore: integer 0-100
  - predictionData: JSON object with specific details
  
  Hunter Context:
  ${JSON.stringify(context, null, 2)}
  `;
  
  try {
    const aiResponse = await generateAriaResponse(userId, prompt);
    // Try to extract JSON from aiResponse
    const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    let predictions = [];
    try {
      predictions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse predictions JSON', e);
      return [];
    }

    const savedPredictions = [];
    for (const pred of predictions) {
      const doc = await AriaPrediction.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: pred.type,
        confidenceScore: pred.confidenceScore,
        predictionData: pred.predictionData,
        status: 'ACTIVE'
      });
      savedPredictions.push(doc);
    }
    
    return savedPredictions;
  } catch (error) {
    console.error('Error generating predictions', error);
    return [];
  }
};

export const getActivePredictions = async (userId: string) => {
  return await AriaPrediction.find({ userId, status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(10);
};
