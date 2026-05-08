/**
 * User profile controllers
 * Handles retrieving and updating user profiles
 */

import { Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';

/**
 * Get the authenticated user's profile
 * GET /users/me
 */
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    // User is already attached to the request by the authenticate middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    // Fetch user from database
    const foundUsers = await db.select().from(users).where(eq(users.id, userId));

    if (foundUsers.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = foundUsers[0];

    // Return user profile data
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      photoUrl: user.photoUrl,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a user's public profile by ID
 * GET /users/:id
 */
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Fetch user from database
    const foundUsers = await db.select().from(users).where(eq(users.id, id));

    if (foundUsers.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = foundUsers[0];

    // Return public profile data (without email)
    res.status(200).json({
      id: user.id,
      name: user.name,
      bio: user.bio,
      photoUrl: user.photoUrl,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update the authenticated user's profile
 * PUT /users/me
 */
export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const { name, bio, photoUrl } = req.body;

    // Validate at least one field is provided
    if (!name && !bio && !photoUrl) {
      res.status(400).json({ error: 'At least one field (name, bio, or photoUrl) must be provided' });
      return;
    }

    // Validate name if provided
    if (name !== undefined && name !== null) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Name cannot be empty' });
        return;
      }
    }

    // Validate bio if provided
    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string') {
        res.status(400).json({ error: 'Bio must be a string' });
        return;
      }
    }

    // Validate photoUrl if provided
    if (photoUrl !== undefined && photoUrl !== null) {
      if (typeof photoUrl !== 'string' || photoUrl.trim().length === 0) {
        res.status(400).json({ error: 'Photo URL cannot be empty' });
        return;
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<{ name: string; bio: string | null; photoUrl: string | null }> = {};
    if (name !== undefined && name !== null) {
      updateData.name = name.trim();
    }
    if (bio !== undefined) {
      updateData.bio = bio.trim() || null;
    }
    if (photoUrl !== undefined && photoUrl !== null) {
      updateData.photoUrl = photoUrl.trim();
    }

    // Update user in database
    const updatedUsers = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updatedUsers.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updatedUser = updatedUsers[0];

    // Return updated profile data
    res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      bio: updatedUser.bio,
      photoUrl: updatedUser.photoUrl,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
