/**
 * Authentication Service Tests
 * Tests for authentication endpoints and middleware
 */

import request from 'supertest';
import { db } from '../../server/src/db';
import { users } from '../../server/src/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { app } from '../../server/src/index';
import { authenticate, optionalAuth, AuthRequest } from '../../server/src/middleware/auth';

describe('Authentication Service', () => {
  let testUser: any;
  let testToken: string;
  let jwtSecret: string;
  let jwtExpiresIn: string;

  beforeAll(async () => {
    // Set up test environment variables
    // IMPORTANT: This is a TEST-ONLY fallback value. In production, JWT_SECRET MUST be set
    // via environment variable with a strong, unique value. Never use this in production.
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/social_app_test';

    // Clean up any existing test data
    await db.delete(users);

    // Create a test user
    const passwordHash = await require('bcryptjs').hash('TestPassword123!', 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        passwordHash,
        name: 'Test User',
      })
      .returning();

    testUser = newUser;

    // Generate a test JWT token
    // JWT_SECRET is guaranteed to be set at this point (see beforeAll above)
    jwtSecret = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';
    jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    testToken = jwt.sign(
      {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(users);
  });

  describe('POST /auth/register', () => {
    describe('Happy Path', () => {
      it('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'newuser@example.com',
            password: 'NewPassword123!',
            name: 'New User',
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email', 'newuser@example.com');
        expect(response.body).toHaveProperty('name', 'New User');
        expect(response.body).not.toHaveProperty('passwordHash');
      });

      it('should register user with lowercase email', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'MixedCase@Example.COM',
            password: 'Password123!',
            name: 'Mixed Case User',
          });

        expect(response.status).toBe(201);
        expect(response.body.email).toBe('mixedcase@example.com');
      });

      it('should register user with trimmed name', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'trimmed@example.com',
            password: 'Password123!',
            name: '  Trimmed Name  ',
          });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Trimmed Name');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing email field', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            password: 'Password123!',
            name: 'Test User',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required fields');
        expect(response.body).toHaveProperty('details', 'Email, password, and name are required');
      });

      it('should return 400 for missing password field', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            name: 'Test User',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required fields');
      });

      it('should return 400 for missing name field', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'Password123!',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required fields');
      });

      it('should return 400 for empty email', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: '',
            password: 'Password123!',
            name: 'Test User',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid email format');
      });

      it('should return 400 for invalid email format', async () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'example.com',
          'user@',
          'user@domain',
          'user@.com',
        ];

        for (const email of invalidEmails) {
          const response = await request(app)
            .post('/auth/register')
            .send({
              email,
              password: 'Password123!',
              name: 'Test User',
            });

          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Invalid email format');
        }
      });

      it('should return 400 for weak password (less than 8 characters)', async () => {
        const weakPasswords = ['Pass1', '12345678', 'abcdefgh', 'Password'];

        for (const password of weakPasswords) {
          const response = await request(app)
            .post('/auth/register')
            .send({
              email: 'test@example.com',
              password,
              name: 'Test User',
            });

          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Password too weak');
          expect(response.body.details).toContain('at least 8 characters');
        }
      });

      it('should return 400 for weak password (no number)', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'PasswordOnly!',
            name: 'Test User',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Password too weak');
      });

      it('should return 400 for weak password (no special character)', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'Password123',
            name: 'Test User',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Password too weak');
      });

      it('should return 400 for empty name', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'Password123!',
            name: '   ',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Name cannot be empty');
      });

      it('should return 400 for whitespace-only name', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'Password123!',
            name: '   ',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Name cannot be empty');
      });
    });

    describe('Duplicate Email Prevention', () => {
      it('should return 409 when email already exists', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
            password: 'NewPassword123!',
            name: 'Another User',
          });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', 'Email already in use');
      });

      it('should prevent user enumeration by returning same error for different passwords', async () => {
        // Try with wrong password first
        const response1 = await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
            password: 'WrongPassword123!',
            name: 'Another User',
          });

        // Try with another wrong password
        const response2 = await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
            password: 'DifferentWrongPassword123!',
            name: 'Another User',
          });

        // Both should return the same error
        expect(response1.status).toBe(409);
        expect(response2.status).toBe(409);
        expect(response1.body.error).toBe(response2.body.error);
      });
    });

    describe('Password Hashing', () => {
      it('should hash the password before storing', async () => {
        const testPassword = 'TestPassword123!';
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'hashingtest@example.com',
            password: testPassword,
            name: 'Hashing Test',
          });

        expect(response.status).toBe(201);

        // Verify password is not stored in plain text
        const storedUser = await db
          .select()
          .from(users)
          .where(eq(users.email, 'hashingtest@example.com'));

        expect(storedUser.length).toBe(1);
        expect(storedUser[0].passwordHash).not.toBe(testPassword);
        expect(storedUser[0].passwordHash).not.toContain(testPassword);

        // Verify password can be verified with bcrypt
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(testPassword, storedUser[0].passwordHash);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('POST /auth/login', () => {
    describe('Happy Path', () => {
      it('should login user with valid credentials', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'TestPassword123!',
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id', testUser.id);
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.body.user).toHaveProperty('name', testUser.name);
        expect(response.body.token).toBeDefined();

        // Verify token is a valid JWT
        const decoded = jwt.verify(response.body.token, jwtSecret);
        expect(decoded).toHaveProperty('id', testUser.id);
        expect(decoded).toHaveProperty('email', testUser.email);
        expect(decoded).toHaveProperty('name', testUser.name);
      });

      it('should login user with lowercase email', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email.toUpperCase(),
            password: 'TestPassword123!',
          });

        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe(testUser.email);
      });
    });

    describe('Invalid Credentials', () => {
      it('should return 401 for wrong password', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword123!',
          });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid credentials');
      });

      it('should return 401 for non-existent email', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'SomePassword123!',
          });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid credentials');
      });

      it('should prevent user enumeration by returning same error for wrong password vs non-existent email', async () => {
        // Wrong password
        const response1 = await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword123!',
          });

        // Non-existent email
        const response2 = await request(app)
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'SomePassword123!',
          });

        // Both should return the same error message and status
        expect(response1.status).toBe(401);
        expect(response2.status).toBe(401);
        expect(response1.body.error).toBe(response2.body.error);
        expect(response1.body.error).toBe('Invalid credentials');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing email field', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            password: 'Password123!',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required fields');
        expect(response.body.details).toBe('Email and password are required');
      });

      it('should return 400 for missing password field', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: 'test@example.com',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing required fields');
      });

      it('should return 400 for invalid email format', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: 'invalid-email',
            password: 'Password123!',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid email format');
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post('/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 401 with expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        },
        jwtSecret,
        { expiresIn: '-1h' } // Expired token
      );

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token expired');
    });
  });

  describe('GET /auth/me', () => {
    describe('Happy Path', () => {
      it('should return current user info with valid token', async () => {
        const response = await request(app)
          .get('/auth/me')
          .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', testUser.id);
        expect(response.body).toHaveProperty('email', testUser.email);
        expect(response.body).toHaveProperty('name', testUser.name);
        expect(response.body).toHaveProperty('bio');
        expect(response.body).toHaveProperty('photoUrl');
      });

      it('should return user with bio and photoUrl if present', async () => {
        // Update user with bio and photo
        await db
          .update(users)
          .set({
            bio: 'Test bio',
            photoUrl: 'https://example.com/photo.jpg',
          })
          .where(eq(users.id, testUser.id));

        const response = await request(app)
          .get('/auth/me')
          .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.bio).toBe('Test bio');
        expect(response.body.photoUrl).toBe('https://example.com/photo.jpg');
      });
    });

    describe('Unauthorized Access', () => {
      it('should return 401 without authentication token', async () => {
        const response = await request(app)
          .get('/auth/me');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Authentication required');
      });

      it('should return 401 with invalid token', async () => {
        const response = await request(app)
          .get('/auth/me')
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid token');
      });

      it('should return 401 with expired token', async () => {
        const expiredToken = jwt.sign(
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          jwtSecret,
          { expiresIn: '-1h' }
        );

        const response = await request(app)
          .get('/auth/me')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Token expired');
      });

      it('should return 404 if user no longer exists', async () => {
        // Delete the test user
        await db.delete(users);

        const response = await request(app)
          .get('/auth/me')
          .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
      });
    });
  });

  describe('authenticate Middleware', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    describe('Valid Token', () => {
      it('should attach user to request with valid token', async () => {
        const validToken = jwt.sign(
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          jwtSecret,
          { expiresIn: jwtExpiresIn }
        );

        req.headers = {
          authorization: `Bearer ${validToken}`,
        };

        await authenticate(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(testUser.id);
        expect(req.user.email).toBe(testUser.email);
        expect(req.user.name).toBe(testUser.name);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it('should handle tokens with different expiration times', async () => {
        const longToken = jwt.sign(
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          jwtSecret,
          { expiresIn: '30d' }
        );

        req.headers = {
          authorization: `Bearer ${longToken}`,
        };

        await authenticate(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
      });
    });

    describe('Missing Token', () => {
      it('should return 401 when no authorization header is provided', async () => {
        req.headers = {};

        await authenticate(req as AuthRequest, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 when authorization header is empty', async () => {
        req.headers = {
          authorization: '',
        };

        await authenticate(req as AuthRequest, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 when authorization header is missing Bearer prefix', async () => {
        req.headers = {
          authorization: 'invalid-token',
        };

        await authenticate(req as AuthRequest, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Invalid Token', () => {
      it('should return 401 with invalid token', async () => {
        req.headers = {
          authorization: 'Bearer invalid-token',
        };

        await authenticate(req as AuthRequest, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 with malformed token', async () => {
        req.headers = {
          authorization: 'Bearer not-a-valid-jwt',
        };

        await authenticate(req as AuthRequest, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Expired Token', () => {
      it('should return 401 with expired token', async () => {
        const expiredToken = jwt.sign(
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          jwtSecret,
          { expiresIn: '-1h' }
        );

        req.headers = {
          authorization: `Bearer ${expiredToken}`,
        };

        await authenticate(req as AuthRequest, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should handle tokens expiring in the future correctly', async () => {
        const futureToken = jwt.sign(
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          jwtSecret,
          { expiresIn: '1h' }
        );

        req.headers = {
          authorization: `Bearer ${futureToken}`,
        };

        await authenticate(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
      });
    });
  });

  describe('optionalAuth Middleware', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    describe('Valid Token', () => {
      it('should attach user to request with valid token', async () => {
        const validToken = jwt.sign(
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          jwtSecret,
          { expiresIn: jwtExpiresIn }
        );

        req.headers = {
          authorization: `Bearer ${validToken}`,
        };

        await optionalAuth(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(testUser.id);
        expect(req.user.email).toBe(testUser.email);
        expect(req.user.name).toBe(testUser.name);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });
    });

    describe('Missing Token', () => {
      it('should call next without attaching user when no token is provided', async () => {
        req.headers = {};

        await optionalAuth(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).not.toBeDefined();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it('should call next without attaching user when authorization header is empty', async () => {
        req.headers = {
          authorization: '',
        };

        await optionalAuth(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).not.toBeDefined();
      });

      it('should call next without attaching user when authorization header is missing Bearer prefix', async () => {
        req.headers = {
          authorization: 'invalid-token',
        };

        await optionalAuth(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).not.toBeDefined();
      });
    });

    describe('Invalid Token', () => {
      it('should call next without attaching user when token is invalid', async () => {
        req.headers = {
          authorization: 'Bearer invalid-token',
        };

        await optionalAuth(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).not.toBeDefined();
      });

      it('should call next without attaching user when token is malformed', async () => {
        req.headers = {
          authorization: 'Bearer not-a-valid-jwt',
        };

        await optionalAuth(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).not.toBeDefined();
      });
    });

    describe('Expired Token', () => {
      it('should call next without attaching user when token is expired', async () => {
        const expiredToken = jwt.sign(
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          jwtSecret,
          { expiresIn: '-1h' }
        );

        req.headers = {
          authorization: `Bearer ${expiredToken}`,
        };

        await optionalAuth(req as AuthRequest, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).not.toBeDefined();
      });
    });

    it('should work correctly with both authenticated and unauthenticated requests', async () => {
      const validToken = jwt.sign(
        {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      // Test with token
      req.headers = {
        authorization: `Bearer ${validToken}`,
      };
      await optionalAuth(req as AuthRequest, res, next);
      expect(req.user).toBeDefined();

      // Test without token
      req.headers = {};
      await optionalAuth(req as AuthRequest, res, next);
      expect(req.user).not.toBeDefined();
    });
  });

  describe('JWT Token Generation and Verification', () => {
    it('should generate token with correct payload structure', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!',
        });

      const token = response.body.token;
      const decoded = jwt.verify(token, jwtSecret) as any;

      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('name');
      expect(typeof decoded.id).toBe('string');
      expect(typeof decoded.email).toBe('string');
      expect(typeof decoded.name).toBe('string');
    });

    it('should verify token with correct secret', async () => {
      const validToken = jwt.sign(
        {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      const decoded = jwt.verify(validToken, jwtSecret) as any;
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.name).toBe(testUser.name);
    });

    it('should reject token with wrong secret', async () => {
      const validToken = jwt.sign(
        {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        },
        'wrong-secret',
        { expiresIn: jwtExpiresIn }
      );

      expect(() => {
        jwt.verify(validToken, jwtSecret);
      }).toThrow();
    });

    it('should handle token expiration correctly', async () => {
      const shortLivedToken = jwt.sign(
        {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        },
        jwtSecret,
        { expiresIn: '1s' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(() => {
        jwt.verify(shortLivedToken, jwtSecret);
      }).toThrow(jwt.TokenExpiredError);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for database errors during registration', async () => {
      // Mock database error
      const originalSelect = db.select;
      db.select = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      // Restore original function
      db.select = originalSelect;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Registration failed');
      expect(response.body.details).toBe('An unexpected error occurred during registration');
    });

    it('should return 500 for database errors during login', async () => {
      const originalSelect = db.select;
      db.select = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!',
        });

      // Restore original function
      db.select = originalSelect;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Login failed');
      expect(response.body.details).toBe('An unexpected error occurred during login');
    });

    it('should return 500 for database errors during get current user', async () => {
      const originalSelect = db.select;
      db.select = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${testToken}`);

      // Restore original function
      db.select = originalSelect;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch user');
      expect(response.body.details).toBe('An unexpected error occurred');
    });
  });
});
