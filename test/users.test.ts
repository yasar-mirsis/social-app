/**
 * User Profile Service Tests
 * Tests for user profile endpoints: GET /users/me, GET /users/:id, PUT /users/me
 */

import request from 'supertest';
import { app } from '../../server/src/index';
import { db } from '../../server/src/db';
import { users } from '../../server/src/db/schema';
import { eq } from 'drizzle-orm';

// Mock database operations
jest.mock('../../server/src/db', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock authentication middleware
jest.mock('../../server/src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // Mock authentication that accepts any request with valid JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Mock user data attached by auth middleware
      req.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
  },
}));

describe('User Profile Service', () => {
  let mockSelectFn: jest.Mock;
  let mockUpdateFn: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockSelectFn = db.select as jest.Mock;
    mockUpdateFn = db.update as jest.Mock;
  });

  describe('GET /users/me - Get Current User Profile', () => {
    it('should return the authenticated user profile on success', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
        photoUrl: 'https://example.com/photo.jpg',
      };

      mockSelectFn.mockResolvedValue([mockUser]);

      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        bio: mockUser.bio,
        photoUrl: mockUser.photoUrl,
      });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select).toHaveBeenCalledWith().from(users);
      expect(db.select).toHaveBeenCalledWith().from(users).where(eq(users.id, 'test-user-id'));
    });

    it('should return 401 when no authorization token is provided', async () => {
      const response = await request(app).get('/users/me');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized: No token provided' });
      expect(db.select).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token format is provided', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'InvalidToken');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized: No token provided' });
      expect(db.select).not.toHaveBeenCalled();
    });

    it('should return 404 when user is not found in database', async () => {
      mockSelectFn.mockResolvedValue([]);

      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
      expect(db.select).toHaveBeenCalled();
    });

    it('should return 500 when database query fails', async () => {
      mockSelectFn.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /users/:id - Get Public User Profile', () => {
    it('should return a user profile by ID on success', async () => {
      const mockUser = {
        id: 'target-user-id',
        email: 'target@example.com',
        name: 'Target User',
        bio: 'Target bio',
        photoUrl: 'https://example.com/target-photo.jpg',
      };

      mockSelectFn.mockResolvedValue([mockUser]);

      const response = await request(app)
        .get('/users/target-user-id')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        bio: mockUser.bio,
        photoUrl: mockUser.photoUrl,
      });
      // Email should not be returned for public profile
      expect(response.body).not.toHaveProperty('email');
      expect(db.select).toHaveBeenCalledWith().from(users);
      expect(db.select).toHaveBeenCalledWith().from(users).where(eq(users.id, 'target-user-id'));
    });

    it('should return 404 when user is not found', async () => {
      mockSelectFn.mockResolvedValue([]);

      const response = await request(app)
        .get('/users/nonexistent-id')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
      expect(db.select).toHaveBeenCalled();
    });

    it('should return 400 when user ID is missing from params', async () => {
      const response = await request(app)
        .get('/users/')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'User ID is required' });
      expect(db.select).not.toHaveBeenCalled();
    });

    it('should return 500 when database query fails', async () => {
      mockSelectFn.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/users/valid-id')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    it('should handle various user ID formats', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'uuid@example.com',
        name: 'UUID User',
        bio: 'UUID test',
        photoUrl: 'https://example.com/uuid.jpg',
      };

      mockSelectFn.mockResolvedValue([mockUser]);

      const response = await request(app)
        .get('/users/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mockUser.id);
    });
  });

  describe('PUT /users/me - Update Current User Profile', () => {
    const validToken = 'Bearer valid-token';

    it('should update name field only', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Updated Name',
        bio: 'Original bio',
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(db.update).toHaveBeenCalledWith(users);
      expect(db.update).toHaveBeenCalledWith(users).set({ name: 'Updated Name' });
      expect(db.update).toHaveBeenCalledWith(users).set({ name: 'Updated Name' }).where(eq(users.id, 'test-user-id'));
    });

    it('should update bio field only', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Updated bio',
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ bio: 'Updated bio' });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Updated bio');
      expect(db.update).toHaveBeenCalledWith(users).set({ bio: 'Updated bio' });
    });

    it('should update photoUrl field only', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: null,
        photoUrl: 'https://example.com/new-photo.jpg',
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ photoUrl: 'https://example.com/new-photo.jpg' });

      expect(response.status).toBe(200);
      expect(response.body.photoUrl).toBe('https://example.com/new-photo.jpg');
      expect(db.update).toHaveBeenCalledWith(users).set({ photoUrl: 'https://example.com/new-photo.jpg' });
    });

    it('should update multiple fields at once', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Updated Name',
        bio: 'Updated bio',
        photoUrl: 'https://example.com/new-photo.jpg',
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({
          name: 'Updated Name',
          bio: 'Updated bio',
          photoUrl: 'https://example.com/new-photo.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.bio).toBe('Updated bio');
      expect(response.body.photoUrl).toBe('https://example.com/new-photo.jpg');
      expect(db.update).toHaveBeenCalledWith(users).set({
        name: 'Updated Name',
        bio: 'Updated bio',
        photoUrl: 'https://example.com/new-photo.jpg',
      });
    });

    it('should trim name field', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Trimmed Name',
        bio: null,
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ name: '  Trimmed Name  ' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Trimmed Name');
      expect(db.update).toHaveBeenCalledWith(users).set({ name: 'Trimmed Name' });
    });

    it('should trim bio field', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Trimmed bio',
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ bio: '  Trimmed bio  ' });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Trimmed bio');
      expect(db.update).toHaveBeenCalledWith(users).set({ bio: 'Trimmed bio' });
    });

    it('should trim photoUrl field', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: null,
        photoUrl: 'https://example.com/trimmed-url.com',
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ photoUrl: '  https://example.com/trimmed-url.com  ' });

      expect(response.status).toBe(200);
      expect(response.body.photoUrl).toBe('https://example.com/trimmed-url.com');
      expect(db.update).toHaveBeenCalledWith(users).set({ photoUrl: 'https://example.com/trimmed-url.com' });
    });

    it('should set bio to null when empty string is provided', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: null,
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ bio: '' });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe(null);
      expect(db.update).toHaveBeenCalledWith(users).set({ bio: null });
    });

    it('should return 400 when no fields are provided', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'At least one field (name, bio, or photoUrl) must be provided'
      });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when empty object is provided', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'At least one field (name, bio, or photoUrl) must be provided'
      });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when name is an empty string', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Name cannot be empty' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when name is only whitespace', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Name cannot be empty' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when bio is not a string', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ bio: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bio must be a string' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when bio is a number', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ bio: 456 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Bio must be a string' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when photoUrl is an empty string', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ photoUrl: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Photo URL cannot be empty' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when photoUrl is only whitespace', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ photoUrl: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Photo URL cannot be empty' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 400 when photoUrl is not a string', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ photoUrl: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Photo URL cannot be empty' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 404 when user is not found after update', async () => {
      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 500 when database update fails', async () => {
      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(new Error('Database update failed')),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', validToken)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    it('should return 401 when no authorization token is provided', async () => {
      const response = await request(app)
        .put('/users/me')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized: No token provided' });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token format is provided', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'InvalidToken')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized: No token provided' });
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Integration Scenarios', () => {
    it('should handle null values in request body', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: null,
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: null, bio: null, photoUrl: null });

      // Should reject because no valid fields provided
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'At least one field (name, bio, or photoUrl) must be provided'
      });
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should handle undefined values in request body', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Updated bio',
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: undefined, bio: 'Updated bio', photoUrl: undefined });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Updated bio');
      expect(db.update).toHaveBeenCalledWith(users).set({ bio: 'Updated bio' });
    });

    it('should handle special characters in bio', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Special chars: @#$%^&*()_+-=[]{}|;:\'",.<>?/~`',
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .send({ bio: 'Special chars: @#$%^&*()_+-=[]{}|;:\'",.<>?/~`' });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Special chars: @#$%^&*()_+-=[]{}|;:\'",.<>?/~`');
    });

    it('should handle URL-encoded characters in name', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'O\'Brien & Co.',
        bio: null,
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'O\'Brien & Co.' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("O'Brien & Co.");
    });

    it('should handle very long bio', async () => {
      const longBio = 'A'.repeat(1000);
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: longBio,
        photoUrl: null,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .send({ bio: longBio });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe(longBio);
    });

    it('should handle very long photo URL', async () => {
      const longUrl = 'https://example.com/photo/' + 'x'.repeat(500);
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        bio: null,
        photoUrl: longUrl,
      };

      mockUpdateFn.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .send({ photoUrl: longUrl });

      expect(response.status).toBe(200);
      expect(response.body.photoUrl).toBe(longUrl);
    });
  });
});
