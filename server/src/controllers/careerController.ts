import { _Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getCareerProfile, updateCareerProfile } from '../services/careerService';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await getCareerProfile(req.user!.id);
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await updateCareerProfile(req.user!.id, req.body);
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};
