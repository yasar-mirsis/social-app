/**
 * Authentication controllers
 * Handles user registration and login logic
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, NewUser } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Registration request body
 */
interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
}

/**
 * Login request body
 */
interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password requirements
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Register a new user
 * POST /auth/register
 */
export async function register(req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password length
    if (password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
      return;
    }

    // Validate name is not empty
    if (name.trim().length === 0) {
      res.status(400).json({ error: 'Name cannot be empty' });
      return;
    }

    // Check if email already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (existingUsers.length > 0) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: NewUser = {
      email: email.toLowerCase(),
      passwordHash,
      name: name.trim(),
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();

    // Return user data (without password hash)
    res.status(201).json({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Login an existing user
 * POST /auth/login
 */
export async function login(req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Find user by email
    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (foundUsers.length === 0) {
      // Return generic error to prevent user enumeration
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = foundUsers[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Return generic error to prevent user enumeration
      res.status(401).json({ error: 'Invalid credentials' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Logout a user
 * POST /auth/logout
 * Note: With stateless JWT, logout is handled client-side by deleting the token
 * This endpoint exists for API consistency and future session management
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  // With stateless JWT, logout is handled client-side
  // This endpoint can be used for logging, analytics, or future session blacklist
  res.status(200).json({ message: 'Logged out successfully' });
}
