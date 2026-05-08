/**
 * Authentication routes
 * Defines endpoints for user registration, login, and logout
 */

import { Router } from 'express';
import { register, login, logout } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /auth/register
 * Register a new user account
 */
router.post('/register', register);

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', login);

/**
 * POST /auth/logout
 * Logout the current user (requires authentication)
 */
router.post('/logout', authenticate, logout);

export default router;
