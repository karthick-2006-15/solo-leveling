import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { userService } from '../services/userService';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserProfile(req.user!.id);
  res.status(200).json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.updateUserProfile(req.user!.id, req.body);
  res.status(200).json({ success: true, user });
});
