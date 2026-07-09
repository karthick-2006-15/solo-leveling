import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

import { AppError } from '../utils/AppError';

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies.token;
  
  if (!token || token === 'none') {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token || token === 'none') {
    return next(new AppError('Unauthorized: No token provided', 401));
  }

  // Strip potential double quotes if frontend used JSON.stringify
  token = token.replace(/^"|"$/g, '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_key') as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (_error) {
    return next(new AppError('Unauthorized: Invalid token', 401));
  }
};
