import { dsaRepository } from '../repositories/dsaRepository';
import { skillRepository } from '../repositories/skillRepository';
import { awardXP } from '../services/progressionService';
import { skillService } from '../services/skillService';
import { AppError } from '../utils/AppError';

const DIFFICULTY_SKILL_XP: Record<string, number> = {
  easy: 20,
  medium: 40,
  hard: 60
};

export const dsaService = {
  getProblems: async (userId: string, query: any) => {
    const { topic, difficulty, revisionStatus } = query;
    const filter: any = { userId };

    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (revisionStatus) filter.revisionStatus = revisionStatus;

    return dsaRepository.findProblems(filter);
  },

  logProblem: async (userId: string, data: any) => {
    const problem = await dsaRepository.createProblem({ ...data, userId });

    const globalXpResult = await awardXP(userId, 'dsa_problem_solved', 100);

    let skillXpResult = null;
    const skills = await skillRepository.findSkillsByUserId(userId);
    const dsaSkill = skills.find(s => s.key === 'dsa');
    
    if (dsaSkill) {
      skillXpResult = await skillService.addSkillXP(userId, dsaSkill._id.toString(), DIFFICULTY_SKILL_XP[data.difficulty] || 20);
    }

    return { problem, globalXpResult, skillXpResult };
  },

  updateProblem: async (id: string, userId: string, data: any) => {
    const problem = await dsaRepository.updateProblem(id, userId, data);
    if (!problem) throw new AppError('Problem not found', 404);
    return problem;
  },

  deleteProblem: async (id: string, userId: string) => {
    const problem = await dsaRepository.deleteProblem(id, userId);
    if (!problem) throw new AppError('Problem not found', 404);
    return problem;
  },

  getStats: async (userId: string) => {
    const problems = await dsaRepository.findProblems({ userId });

    const topics: Record<string, number> = {};
    const difficulties: Record<string, number> = {};
    const daily: Record<string, number> = {};

    problems.forEach(p => {
      topics[p.topic] = (topics[p.topic] || 0) + 1;
      difficulties[p.difficulty] = (difficulties[p.difficulty] || 0) + 1;
      
      const dateStr = p.solvedAt.toISOString().split('T')[0];
      daily[dateStr] = (daily[dateStr] || 0) + 1;
    });

    const trend = Object.entries(daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); 

    return {
      topics: Object.entries(topics).map(([name, value]) => ({ name, value })),
      difficulties: Object.entries(difficulties).map(([name, value]) => ({ name, value })),
      trend
    };
  }
};
