import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      agent?: { agentId: string; agentName: string };
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw new AppError(401, 'Missing authorization token');
    }

    const agent = verifyToken(token);
    req.agent = agent;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (token) {
      const agent = verifyToken(token);
      req.agent = agent;
    }
  } catch (error) {
    // Silently fail, allow request to proceed
  }
  next();
};
