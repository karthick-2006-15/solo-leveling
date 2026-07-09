import mongoose from 'mongoose';
import ConversationMessage from '../models/ConversationMessage';
import { gatherUserContext, formatContextForPrompt } from './ariaContextService';
import { getRelevantMemories, saveMemory } from './ariaMemoryService';
import { generateAriaResponse, generateAriaJSON, ARIA_CORE_PERSONA } from './ariaPromptService';

export const handleAriaChat = async (userId: string | mongoose.Types.ObjectId, message: string) => {
  // 1. Gather context & memory
  const [context, memoryStr] = await Promise.all([
    gatherUserContext(userId),
    getRelevantMemories(userId)
  ]);

  const contextStr = formatContextForPrompt(context);

  // 2. Fetch recent conversation history (last 5 messages)
  const history = await ConversationMessage.find({ userId })
    .sort({ createdAt: -1 })
    .limit(6);
  
  const historyStr = history.reverse().map(m => `${m.role === 'user' ? 'Hunter' : 'System'}: ${m.content}`).join('\n');

  // 3. Construct System Prompt
  const fullSystemPrompt = `
${ARIA_CORE_PERSONA}

${contextStr}
${memoryStr}

--- RECENT HISTORY ---
${historyStr}
----------------------
`;

  // 4. Generate Response
  const responseText = await generateAriaResponse(fullSystemPrompt, message, 'gemini');

  // 5. Save Messages
  await ConversationMessage.create({
    userId,
    role: 'user',
    content: message,
    contextSnapshot: JSON.stringify(context)
  });

  await ConversationMessage.create({
    userId,
    role: 'assistant',
    content: responseText,
    contextSnapshot: JSON.stringify(context)
  });

  // 6. Async background task to extract memory
  extractAndSaveMemoryBackground(userId, message, responseText);

  return responseText;
};

// Fire and forget memory extraction
const extractAndSaveMemoryBackground = async (userId: string | mongoose.Types.ObjectId, userMessage: string, aiResponse: string) => {
  try {
    const prompt = `
Analyze the following exchange. Does the user mention any long-term goal, preference, physical weakness, or milestone that the System should remember?
Only extract highly important information that persists over time (e.g., "I have a bad knee", "I want to lose 10 lbs", "I prefer studying at night").
If there is something to remember, output a JSON object: { "shouldRemember": true, "category": "Goal"|"Preference"|"Weakness"|"Milestone"|"General", "content": "The memory", "importance": 1-10 }
If nothing important, output: { "shouldRemember": false }
`;
    const exchange = `Hunter: ${userMessage}\nSystem: ${aiResponse}`;
    
    const extraction = await generateAriaJSON(prompt, exchange);
    if (extraction.shouldRemember && extraction.content) {
      await saveMemory(userId, extraction.category, extraction.content, extraction.importance);
    }
  } catch (_error) {
    // Silently fail background memory extraction
  }
};
