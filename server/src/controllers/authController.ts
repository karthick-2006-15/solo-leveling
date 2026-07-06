import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { OAuth2Client } from 'google-auth-library';
import { userRepository } from '../repositories/userRepository';
import { progressionRepository } from '../repositories/progressionRepository';
import { AppError } from '../utils/AppError';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_jwt_key', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id.toString());
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await userRepository.create({
    name,
    email,
    passwordHash
  });

  await progressionRepository.create({ userId: user._id as any });

  sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userRepository.findByEmail(email);
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  sendTokenResponse(user, 200, res);
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError('Invalid Google token', 400);
  }
  
  let user = await userRepository.findByEmail(payload.email);
  
  if (!user) {
    user = await userRepository.create({
      name: payload.name || 'Hunter',
      email: payload.email,
      googleId: payload.sub
    });
    await progressionRepository.create({ userId: user._id as any });
  } else if (!user.googleId) {
    await userRepository.updateById(user._id as any, { googleId: payload.sub });
  }
  
  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await userRepository.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.status(200).json({ success: true, user });
});
