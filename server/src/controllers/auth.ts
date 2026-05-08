import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';

/**
 * Validation regex for email format
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password length
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Password complexity validation
 * Checks for at least one number and one special character
 */
const validatePasswordStrength = (password: string): { valid: boolean; reason?: string } => {
  // Check minimum length
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      reason: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      valid: false,
      reason: 'Password must contain at least one number',
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      reason: 'Password must contain at least one special character',
    };
  }

  return { valid: true };
};

/**
 * Register a new user
 * POST /auth/register
 */
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'Email, password, and name are required',
      });
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({
        error: 'Invalid email format',
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: 'Password too weak',
        details: passwordValidation.reason,
      });
      return;
    }

    // Validate name is not empty
    if (name.trim().length === 0) {
      res.status(400).json({
        error: 'Name cannot be empty',
      });
      return;
    }

    // Check if email already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existingUsers.length > 0) {
      res.status(409).json({
        error: 'Email already in use',
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name: name.trim(),
      })
      .returning();

    // Return user data (excluding password)
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: 'An unexpected error occurred during registration',
    });
  }
};

/**
 * Login user
 * POST /auth/login
 */
export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'Email and password are required',
      });
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({
        error: 'Invalid email format',
      });
      return;
    }

    // Find user by email
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (foundUsers.length === 0) {
      // Return generic error to prevent user enumeration
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    const user = foundUsers[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Return generic error to prevent user enumeration
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      } as jwt.SignOptions
    );

    // Return token and user data
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      details: 'An unexpected error occurred during login',
    });
  }
};

/**
 * Logout user
 * POST /auth/logout
 * Note: JWT tokens are stateless, so logout is handled on the client side
 * by removing the token. This endpoint exists for API completeness and
 * can be used for server-side logging or token invalidation in the future.
 */
export const logout = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // JWT tokens are stateless, so actual logout is handled client-side
    // This endpoint can be used for logging or future token blacklisting
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: 'An unexpected error occurred during logout',
    });
  }
};

/**
 * Get current user info
 * GET /auth/me
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
      });
      return;
    }

    // Fetch user from database
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id));

    if (foundUsers.length === 0) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    const user = foundUsers[0];

    // Return user data (excluding password)
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      photoUrl: user.photoUrl,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      details: 'An unexpected error occurred',
    });
  }
};
