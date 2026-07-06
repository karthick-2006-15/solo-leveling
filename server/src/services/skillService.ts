import { skillRepository } from '../repositories/skillRepository';
import { awardXP, checkAchievements } from '../services/progressionService';
import { AppError } from '../utils/AppError';

export interface SkillXPResult {
  leveledUp: boolean;
  newLevel: number;
  xpAdded: number;
  currentXP: number;
  completionPercent: number;
  newAchievements?: Array<{ id: string; name: string; icon: string }>;
}

export const MASTERY_CAP_LEVEL = 10;

export const xpRequiredForSkillLevel = (level: number): number => {
  return Math.round(50 * Math.pow(level, 1.5));
};

export const getCompletionPercent = (level: number): number => {
  return Math.min(100, Math.round((level / MASTERY_CAP_LEVEL) * 100));
};

export const skillService = {
  getSkills: async (userId: string) => {
    const PRESET_SKILLS = [
      { key: 'html', name: 'HTML', icon: 'FileCode2' },
      { key: 'css', name: 'CSS', icon: 'Palette' },
      { key: 'js', name: 'JavaScript', icon: 'FileJson' },
      { key: 'ts', name: 'TypeScript', icon: 'FileType2' },
      { key: 'react', name: 'React', icon: 'Atom' },
      { key: 'node', name: 'Node.js', icon: 'Server' },
      { key: 'express', name: 'Express', icon: 'ServerCog' },
      { key: 'mongodb', name: 'MongoDB', icon: 'Database' },
      { key: 'sql', name: 'SQL', icon: 'Table' },
      { key: 'dsa', name: 'DSA', icon: 'Binary' },
      { key: 'system_design', name: 'System Design', icon: 'Network' },
      { key: 'ai', name: 'AI', icon: 'BrainCircuit' },
      { key: 'devops', name: 'DevOps', icon: 'TerminalSquare' }
    ];

    let skills = await skillRepository.findSkillsByUserId(userId);

    if (skills.length === 0) {
      const seeded = PRESET_SKILLS.map(s => ({
        ...s,
        userId: userId as any,
        currentXP: 0,
        level: 1
      }));
      skills = await skillRepository.insertMany(seeded);
    }

    return skills.map(s => ({
      ...s.toObject(),
      completionPercent: getCompletionPercent(s.level)
    }));
  },

  addCustomSkill: async (userId: string, data: any) => {
    const { name, icon } = data;
    const key = name.toLowerCase().replace(/\\s+/g, '_');
    
    const skill = await skillRepository.create({ userId: userId as any, key, name, icon });
    return { ...skill.toObject(), completionPercent: getCompletionPercent(skill.level) };
  },

  editSkillNotes: async (skillId: string, userId: string, notes: string) => {
    const skill = await skillRepository.update(skillId, userId, { notes });
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  },

  addResource: async (skillId: string, userId: string, data: any) => {
    const { title, url } = data;
    const skill = await skillRepository.update(skillId, userId, { $push: { learningResources: { title, url } } });
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  },

  deleteResource: async (skillId: string, userId: string, resourceId: string) => {
    const skill = await skillRepository.update(skillId, userId, { $pull: { learningResources: { _id: resourceId } } });
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  },

  addMilestone: async (skillId: string, userId: string, data: any) => {
    const { title, xpReward } = data;
    const skill = await skillRepository.update(skillId, userId, { $push: { milestones: { title, xpReward: xpReward || 50, completed: false } } });
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  },

  addSkillXP: async (userId: string, skillId: string, amount: number): Promise<SkillXPResult> => {
    const skill = await skillRepository.findByIdAndUserId(skillId, userId);
    if (!skill) throw new AppError('Skill not found', 404);

    skill.currentXP += amount;
    let leveledUp = false;
    let newLevel = skill.level;

    while (true) {
      const required = xpRequiredForSkillLevel(newLevel);
      if (skill.currentXP >= required) {
        skill.currentXP -= required;
        newLevel += 1;
        leveledUp = true;
      } else {
        break;
      }
    }

    if (leveledUp) {
      skill.level = newLevel;
    }

    await skillRepository.save(skill);
    const newAchievements = await checkAchievements(userId);

    return {
      leveledUp,
      newLevel: skill.level,
      xpAdded: amount,
      currentXP: skill.currentXP,
      completionPercent: getCompletionPercent(skill.level),
      newAchievements
    };
  },

  completeMilestone: async (skillId: string, userId: string, milestoneId: string) => {
    const skill = await skillRepository.findByIdAndUserId(skillId, userId);
    if (!skill) throw new AppError('Skill not found', 404);

    const milestone = skill.milestones.find(m => m._id.toString() === milestoneId);
    if (!milestone) throw new AppError('Milestone not found', 404);
    
    if (milestone.completed) {
      throw new AppError('Already completed', 400);
    }

    milestone.completed = true;
    milestone.completedAt = new Date();
    await skillRepository.save(skill);

    const skillXpResult = await skillService.addSkillXP(userId, skillId, milestone.xpReward);
    return { skill, skillXpResult };
  },

  logStudySession: async (userId: string, data: any) => {
    const { skillId, durationMinutes, notes } = data;
    const session = await skillRepository.createStudySession({ userId: userId as any, skillId: skillId as any, durationMinutes, notes });
    
    const globalXpResult = await awardXP(userId, 'study_session', 80);
    const skillXpResult = await skillService.addSkillXP(userId, skillId, 30);

    return { session, globalXpResult, skillXpResult };
  }
};
