import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';
import { GoogleGenAI } from '@google/genai';
import { buildUserContext, compressMemory, vectorSearchContext, embedMessage } from '../services/aiContextService';
import ConversationMessage from '../models/ConversationMessage';
import ConversationSummary from '../models/ConversationSummary';
import User from '../models/User';
import { format } from 'date-fns';

const CONVERSATION_LIMIT = 20;

// Note: Ensure GEMINI_API_KEY is in .env
let aiClient: GoogleGenAI;
const getAi = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy_key_for_testing'
    });
  }
  return aiClient;
};

export const chat = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log('Step 1: Request received for chat');
  const userId = req.user?.id;
  const { message } = req.body;

  if (!userId || !message) {
    console.log('Failed Step 1: Missing userId or message');
    res.status(400).json({ message: 'User ID and message are required' });
    return;
  }

  console.log('Step 2: Fetching user data for ID:', userId);

  // 1. Fetch User Data
  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // 2. Fetch context & history
  console.log('Step 3: Building user context');
  const context = await buildUserContext(userId);
  console.log('Step 4: Fetching conversation history');
  const historyRecords = await ConversationMessage.find({ userId })
    .sort({ createdAt: -1 })
    .limit(CONVERSATION_LIMIT)
    .lean();
    
  historyRecords.reverse(); // Chronological order

  const history = historyRecords.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Background compression if approaching limit
  // Fire and forget
  console.log('Step 5: Triggering background memory compression');
  compressMemory(userId).catch(err => console.error(err));

  // Fetch summary & vector context
  console.log('Step 6: Fetching conversation summary and vector context');
  const summaryDoc = await ConversationSummary.findOne({ userId });
  const memorySummary = summaryDoc ? `\n== LONG-TERM MEMORY SUMMARY ==\n${summaryDoc.summary}\n` : '';
  const vectorContext = await vectorSearchContext(userId, message);

  // Save user message immediately so it isn't lost if AI fails
  console.log('Step 7: Saving user message to ConversationMessage');
  const userMessage = await ConversationMessage.create({
    userId,
    role: 'user',
    content: message
  });
  
  // Asynchronously embed the user message
  console.log('Step 8: Triggering background embedding for user message');
  embedMessage(userMessage._id.toString())
    .then(() => console.log(`User message ${userMessage._id} embedded`))
    .catch(err => console.error(`Failed to embed user msg:`, err));

  // 3. Assemble prompt
  const systemPrompt = `
You are ARIA (Adaptive RPG Intelligence Assistant), the personal AI guide
of ${user.name} inside the Solo Leveling Life System. You have full access
to their real-time health, fitness, learning, and progression data, shown
below. Use it to give specific, personalized advice — never generic
responses.

You are direct, encouraging, and competitive (in the way a good training
partner would be). You speak with the tone of a slightly dramatic RPG guide
who takes the user's real-life growth seriously. Keep answers concise unless
the user asks for detail.

CURRENT DATE: ${todayStr}

== USER DATA ==
${context}
${memorySummary}
${vectorContext}
`.trim();

  console.log('Step 9: Assembling prompt and messages array');
  const messages: any[] = [
    ...history,
    { role: 'user', parts: [{ text: message }] }
  ];

  console.log('Step 10: Sending request to Gemini API...');

  try {
    let fullResponse = '';

    if (process.env.GEMINI_API_KEY) {
      const ai = getAi();
      const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: messages,
        config: {
          systemInstruction: systemPrompt
        }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of stream) {
        const content = chunk.text || '';
        fullResponse += content;
        // Write SSE format
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Mock response for testing without API key
      fullResponse = "I'm ARIA! (Mock Response since Gemini API key is missing)";
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
    
    // 4. Save Assistant message to DB after streaming finishes
    console.log('Step 11: Streaming finished, preparing to save assistant message to DB...');
    const assistantMessage = await ConversationMessage.create({
      userId,
      role: 'assistant',
      content: fullResponse
    });
    
    console.log('Step 12: Database write successful, triggering assistant message embedding');

    // Background embedding for assistant message
    embedMessage(assistantMessage._id.toString())
      .then(() => console.log(`Embedding generated for message ${assistantMessage._id}`))
      .catch(err => console.error(`Embedding failed for message ${assistantMessage._id}:`, err));

  } catch (error: any) {
    console.error('--- CRITICAL FAILURE AT CHAT ENDPOINT ---');
    console.error('Exact Error Object:', error);
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);
    if (error.message?.includes('API key not valid') || (error.status === 400 && error.message?.includes('API_KEY_INVALID'))) {
      console.log('Step FAILED: Invalid API Key detected. Falling back to mock response.');
      if (!res.headersSent) {
        const fullResponse = "I'm ARIA! (Mock Response: Your Gemini API key is invalid or expired. Please update it in .env)";
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        
        await ConversationMessage.create({
          userId,
          role: 'assistant',
          content: fullResponse
        }).catch(err => console.error(err));
        return;
      }
    }

    // If headers are already sent, we can't send 502 cleanly, so just close
    if (!res.headersSent) {
      console.log('Step FAILED: Sending 502 Bad Gateway');
      res.status(502).json({ message: 'ARIA is unavailable right now — try again in a moment' });
    } else {
      console.log('Step FAILED: Headers already sent, sending error chunk');
      res.write(`data: ${JSON.stringify({ error: 'ARIA is unavailable right now' })}\n\n`);
      res.end();
    }
  }
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const limit = Number(req.query.limit) || CONVERSATION_LIMIT;

  const historyRecords = await ConversationMessage.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  historyRecords.reverse();

  res.json({ history: historyRecords });
});

export const generateWeeklyReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.body.userId || req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const context = await buildUserContext(userId.toString());
  
  const systemPrompt = `
You are ARIA. You must write a weekly review for ${user.name}.
Based on their activity, summarize their week, highlight what went well, what needs improvement, and set a clear goal for next week.
Format your response entirely in plain text, with simple formatting like newlines and bullet points. Do not use markdown headers.
Keep it concise, supportive, and action-oriented.

== USER DATA ==
${context}
  `.trim();

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
    });

    const content = response.text || 'Your weekly review could not be generated.';
    
    // Save to WeeklyReview collection (Optional)
    res.json({ content });
  } catch (error) {
    console.error('Error generating weekly review:', error);
    res.status(500).json({ message: 'Failed to generate review' });
  }
});

export const generateMealPlan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const context = await buildUserContext(userId.toString());
  
  const systemPrompt = `
You are ARIA, an expert nutritionist. Generate a 7-day meal plan for ${user.name} based on their profile and goals.
Return the result strictly as a valid JSON object matching this schema:
{
  "weekStartDate": "YYYY-MM-DD",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "meals": [
        { "mealType": "Breakfast", "description": "...", "estimatedCalories": number, "estimatedProtein": number },
        { "mealType": "Lunch", "description": "...", "estimatedCalories": number, "estimatedProtein": number },
        { "mealType": "Dinner", "description": "...", "estimatedCalories": number, "estimatedProtein": number }
      ]
    }
  ]
}
Do not return any markdown wrappers, just the raw JSON string.

== USER DATA ==
${context}
  `.trim();

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
    });

    let rawJson = response.text || '{}';
    rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(rawJson);
    res.json(parsed);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ message: 'Failed to generate meal plan' });
  }
});
