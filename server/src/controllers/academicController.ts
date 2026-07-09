import { _Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getAcademicProfile, updateAcademicProfile } from '../services/academicService';

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
