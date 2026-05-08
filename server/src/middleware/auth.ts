/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user information to the request object
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extended Request interface with user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * JWT payload interface
 */
interface JwtPayload {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Authentication middleware
 * Verifies the JWT token from the Authorization header and attaches user data to the request
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Attach user information to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Unauthorized: Token expired' });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
