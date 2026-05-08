/**
 * User profile routes
 * Defines endpoints for retrieving and updating user profiles
 */

import { Router } from 'express';
import { getMe, getUserById, updateMe } from '../controllers/users';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /users/me
 * Get the authenticated user's profile
 */
router.get('/me', authenticate, getMe);

/**
 * GET /users/:id
 * Get a user's public profile by ID
 */
router.get('/:id', authenticate, getUserById);

/**
 * PUT /users/me
 * Update the authenticated user's profile
 */
router.put('/me', authenticate, updateMe);

export default router;
