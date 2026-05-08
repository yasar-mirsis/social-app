import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Email validation regex
 * Simple but effective email format validation
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation
 * Ensures minimum password strength
 */
const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  return { valid: true };
};

/**
 * Generate JWT token
 * Creates a signed JWT with user payload
 */
const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN as string) || '7d' } as any
  );
};

/**
 * Register a new user
 * POST /auth/register
 * Request body: { email: string, password: string, name: string }
 * Response: 201 { id, email, name }
 * Errors: 400 for validation errors, 409 for duplicate email
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }

    // Validate name is not empty
    if (name.trim().length === 0) {
      res.status(400).json({ error: 'Name cannot be empty' });
      return;
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name: name.trim(),
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    // Return user data (excluding password)
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Login user
 * POST /auth/login
 * Request body: { email: string, password: string }
 * Response: 200 { token: string, user: { id, email, name } }
 * Errors: 401 for invalid credentials (does not reveal if email exists)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Look up user by email (case-insensitive)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // If user not found or password doesn't match, return generic error
    // This prevents user enumeration attacks
    if (!user) {
      // Use bcrypt.compare with a dummy hash to prevent timing attacks
      await bcrypt.compare(password, '$2a$10$dummyHashForTimingAttackPrevention');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

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
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * Logout user
 * POST /auth/logout
 * Request: Authorization: Bearer <token>
 * Response: 200 {}
 *
 * Note: Since we use stateless JWT tokens, logout is handled on the client side
 * by removing the token from storage. This endpoint exists for API completeness
 * and can be used for server-side session cleanup if needed in the future.
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // For stateless JWT, logout is handled client-side
    // This endpoint can be used for logging or future session management
    res.status(200).json({});
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};
