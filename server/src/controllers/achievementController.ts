import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import ProgressionProfile from '../models/ProgressionProfile';
import { ACHIEVEMENTS, AchievementConfig } from '../config/progressionConfig';
import { skillRepository } from '../repositories/skillRepository';
import { AppError } from '../utils/AppError';

export const getAchievements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const profile = await ProgressionProfile.findOne({ userId });
  if (!profile) throw new AppError('Profile not found', 404);

  const unlockedMap = new Map();
  profile.unlockedAchievements.forEach(a => {
    unlockedMap.set(a.achievementId, a.unlockedAt);
  });

  const allAchievements: AchievementConfig[] = [...ACHIEVEMENTS];
  
  const skills = await skillRepository.findSkillsByUserId(userId);
  for (const skill of skills) {
    allAchievements.push({
      id: `skill_explorer_${skill._id}`,
      name: `${skill.name} Explorer`,
      description: `Reach Level 5 in ${skill.name}.`,
      icon: skill.icon || '🎯',
      trigger: async () => skill.level >= 5
    });
    allAchievements.push({
      id: `skill_master_${skill._id}`,
      name: `${skill.name} Master`,
      description: `Reach Level 10 in ${skill.name}.`,
      icon: skill.icon || '👑',
      trigger: async () => skill.level >= 10
    });
  }

  const result = allAchievements.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) || null
  }));

  res.status(200).json({ success: true, achievements: result });
});
