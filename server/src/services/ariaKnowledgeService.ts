import { AriaMemory } from '../models/AriaMemory';

export const logKnowledgeNode = async (userId: string, category: string, insight: string) => {
  return await AriaMemory.create({
    userId,
    category: 'KNOWLEDGE_NODE',
    key: category,
    value: insight,
    priority: 'HIGH'
  });
};

export const getKnowledgeNodes = async (userId: string, category?: string) => {
  const query: any = { userId, category: 'KNOWLEDGE_NODE' };
  if (category) {
    query.key = category;
  }
  return await AriaMemory.find(query).sort({ createdAt: -1 });
};
