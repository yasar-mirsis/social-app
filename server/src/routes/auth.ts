import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

/**
 * Authentication routes
 * Base path: /auth
 */
const router = Router();

/**
 * POST /auth/register
 * Register a new user
 * Request body: { email: string, password: string, name: string }
 * Response: 201 { id, email, name }
 */
router.post('/register', register);

/**
 * POST /auth/login
 * Login user
 * Request body: { email: string, password: string }
 * Response: 200 { token: string, user: { id, email, name } }
 */
router.post('/login', login);

/**
 * POST /auth/logout
 * Logout user
 * Headers: Authorization: Bearer <token>
 * Response: 200 { message }
 */
router.post('/logout', authenticate, logout);

/**
 * GET /auth/me
 * Get current user information
 * Headers: Authorization: Bearer <token>
 * Response: 200 { id, email, name, bio, photoUrl }
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
