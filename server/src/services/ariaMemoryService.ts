import mongoose from 'mongoose';
import { AriaMemory } from '../models/AriaMemory';

export const getRelevantMemories = async (userId: string | mongoose.Types.ObjectId): Promise<string> => {
  // For now, fetch top 5 highest importance memories
  const memories = await AriaMemory.find({ userId }).sort({ importance: -1, createdAt: -1 }).limit(10);
  
  if (memories.length === 0) return '';

  const memoryStrings = memories.map(m => `- [${m.category}] ${m.content}`);
  
  return `
--- ARIA SYSTEM MEMORY ---
${memoryStrings.join('\n')}
--------------------------
`;
};

// In the future, this can use an LLM to extract memories from the conversation 
// and save them to the DB. For now, we'll provide a simple save function.
export const saveMemory = async (userId: string | mongoose.Types.ObjectId, category: string, content: string, importance: number = 5) => {
  await AriaMemory.create({ userId, category, content, importance });
};
