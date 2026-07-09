import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { handleAriaChat } from '../services/ariaConversationService';
import { generateMorningReport, generateEveningReport, getLatestReports } from '../services/ariaReportService';
import { getRelevantMemories } from '../services/ariaMemoryService';
import { generatePredictions, getActivePredictions } from '../services/ariaPredictionService';
import { generatePlan, getActivePlans } from '../services/ariaPlannerService';
import { getNextBestAction } from '../services/ariaDecisionEngine';
import { generateDailySchedule } from '../services/ariaSchedulerService';
import { logKnowledgeNode, getKnowledgeNodes } from '../services/ariaKnowledgeService';
export const chatWithAria = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await handleAriaChat(userId, message);
    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMorningReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const report = await generateMorningReport(userId);
    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEveningReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const report = await generateEveningReport(userId);
    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const reports = await getLatestReports(userId);
    res.json({ reports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const memory = await getRelevantMemories(userId);
    res.json({ memory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPredictions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const predictions = await getActivePredictions(userId);
    res.json({ predictions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const runPredictionSweep = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const predictions = await generatePredictions(userId);
    res.json({ predictions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, goal } = req.body;
    const plan = await generatePlan(userId, type, goal);
    res.json({ plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const plans = await getActivePlans(userId);
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDecision = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decision = await getNextBestAction(userId);
    res.json({ decision });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const schedule = await generateDailySchedule(userId);
    res.json({ schedule });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addKnowledge = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, insight } = req.body;
    const node = await logKnowledgeNode(userId, category, insight);
    res.json({ node });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getKnowledge = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category } = req.query;
    const nodes = await getKnowledgeNodes(userId, category as string);
    res.json({ nodes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
