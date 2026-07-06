import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { skillService } from '../services/skillService';
import { missionService } from '../services/missionService';

export const getSkills = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skills = await skillService.getSkills(req.user!.id);
  res.status(200).json({ success: true, skills });
});

export const addCustomSkill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skill = await skillService.addCustomSkill(req.user!.id, req.body);
  res.status(201).json({ success: true, skill });
});

export const editSkillNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skill = await skillService.editSkillNotes(req.params.id, req.user!.id, req.body.notes);
  res.status(200).json({ success: true, skill });
});

export const addResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skill = await skillService.addResource(req.params.id, req.user!.id, req.body);
  res.status(200).json({ success: true, skill });
});

export const deleteResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skill = await skillService.deleteResource(req.params.id, req.user!.id, req.params.resourceId);
  res.status(200).json({ success: true, skill });
});

export const addMilestone = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skill = await skillService.addMilestone(req.params.id, req.user!.id, req.body);
  res.status(200).json({ success: true, skill });
});

export const completeMilestone = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await skillService.completeMilestone(req.params.id, req.user!.id, req.params.milestoneId);
  res.status(200).json({ success: true, ...result });
});

export const logStudySession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await skillService.logStudySession(req.user!.id, req.body);
  
  const newlyCompletedQuests = await missionService.refreshDailyQuests(req.user!.id);
  const newlyDefeatedBoss = await missionService.refreshWeeklyBoss(req.user!.id);

  res.status(201).json({ success: true, ...result, newlyCompletedQuests, newlyDefeatedBoss });
});
