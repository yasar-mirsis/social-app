import { Router } from 'express';
import { register, login, logout } from '../controllers/auth';

/**
 * Authentication routes
 * Defines endpoints for user registration, login, and logout
 */
const router = Router();

/**
 * POST /auth/register
 * Register a new user account
 */
router.post('/register', register);

/**
 * POST /auth/login
 * Authenticate user and receive JWT token
 */
router.post('/login', login);

/**
 * POST /auth/logout
 * Logout user (client-side token removal for stateless JWT)
 */
router.post('/logout', logout);

export default router;
