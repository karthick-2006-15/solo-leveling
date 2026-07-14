import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getAcademicProfile, updateAcademicProfile } from '../services/academicService';
import { awardXP } from '../services/progressionService';
import { monarchService } from '../services/monarchService';
import QuestInstance from '../models/QuestInstance';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await getAcademicProfile(req.user!.id);
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await updateAcademicProfile(req.user!.id, req.body);
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

export const completeAcademicTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId, taskType } = req.body;
    if (!taskId || !taskType) {
      return res.status(400).json({ success: false, message: 'Missing taskId or taskType' });
    }

    const profile = await getAcademicProfile(req.user!.id);
    let taskName = '';
    let xpReward = 100;

    if (taskType === 'assignment') {
      const assignment = profile.assignments.find((a: any) => a._id.toString() === taskId);
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }
      if (assignment.isCompleted) {
        return res.status(400).json({ success: false, message: 'Assignment already completed' });
      }
      assignment.isCompleted = true;
      assignment.progress = 100;
      taskName = assignment.title;
      xpReward = assignment.xpReward || 100;
    } else if (taskType === 'exam') {
      const exam = profile.exams.find((e: any) => e._id.toString() === taskId);
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }
      if (exam.isCompleted) {
        return res.status(400).json({ success: false, message: 'Exam already completed' });
      }
      exam.isCompleted = true;
      exam.preparationPercentage = 100;
      taskName = exam.title;
      xpReward = 250;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid taskType' });
    }

    // Save profile updates
    profile.assignmentsPending = profile.assignments.filter((a: any) => !a.isCompleted).length;
    profile.examsUpcoming = profile.exams.filter((e: any) => !e.isCompleted).length;
    await profile.save();

    // 1. Award XP to Progression profile
    const xpResult = await awardXP(req.user!.id, `academic_${taskType}_${taskName}`, xpReward);

    // 2. Adjust Monarch stats: Focus +1, Wisdom +2, Discipline +2, Corruption -2
    await monarchService.adjustAttributes(req.user!.id, {
      focus: 1,
      wisdom: 2,
      discipline: 2,
      corruption: -2
    });

    // 3. Mark any Daily Mission linked to Study or Academic task completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const activeMissions = await QuestInstance.find({
      userId: req.user!.id,
      date: { $gte: today, $lte: endOfDay },
      status: 'available'
    });

    let completedMissionTitle = '';
    for (const mission of activeMissions) {
      const titleLower = mission.title.toLowerCase();
      if (titleLower.includes('study') || titleLower.includes('academic') || titleLower.includes('class') || titleLower.includes('subject') || titleLower.includes('assignment') || titleLower.includes('exam')) {
        mission.status = 'completed';
        mission.completed = true;
        mission.completedAt = new Date();
        await mission.save();
        completedMissionTitle = mission.title;
        break;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Academic task marked completed and rewarded!',
      xpResult,
      completedMissionTitle,
      profile
    });
  } catch (error) {
    next(error);
  }
};
