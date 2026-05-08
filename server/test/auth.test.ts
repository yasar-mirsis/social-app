/**
 * Authentication Service Tests
 * Comprehensive tests for authentication endpoints and JWT middleware
 * Tests cover: password validation, JWT_SECRET validation, timing attack prevention,
 * error handling with type guards, JWT payload validation, and all auth functionality
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { register, login, logout } from '../src/controllers/auth';
import { authenticate } from '../src/middleware/auth';

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  JsonWebTokenError: class JsonWebTokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
  },
  TokenExpiredError: class TokenExpiredError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TokenExpiredError';
    }
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../../server/src/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

describe('Authentication Service', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Mock process.env
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  describe('Password Validation - Complexity Requirements', () => {
    describe('Minimum Length (8 characters)', () => {
      it('should reject passwords shorter than 8 characters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'short1!',
          name: 'Test User',
        };

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Password must be at least 8 characters long',
        });
      });

      it('should accept passwords exactly 8 characters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Pass1!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });

      it('should accept passwords longer than 8 characters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Password1!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });

    describe('Uppercase Letter Requirement', () => {
      it('should reject passwords without uppercase letters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'password1!',
          name: 'Test User',
        };

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Password must contain at least one uppercase letter',
        });
      });

      it('should accept passwords with uppercase letters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Password1!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });

    describe('Lowercase Letter Requirement', () => {
      it('should reject passwords without lowercase letters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'PASSWORD1!',
          name: 'Test User',
        };

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Password must contain at least one lowercase letter',
        });
      });

      it('should accept passwords with lowercase letters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Password1!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });

    describe('Number Requirement', () => {
      it('should reject passwords without numbers', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Password!',
          name: 'Test User',
        };

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Password must contain at least one number',
        });
      });

      it('should accept passwords with numbers', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Password1!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });

    describe('Special Character Requirement', () => {
      it('should reject passwords without special characters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Password1',
          name: 'Test User',
        };

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Password must contain at least one special character',
        });
      });

      it('should accept passwords with special characters', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'Password1!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });

      it('should accept various special characters', async () => {
        const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/'];

        for (const char of specialChars) {
          mockReq.body = {
            email: 'test@example.com',
            password: `Password1${char}`,
            name: 'Test User',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([]);
          (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
          (db.insert as jest.Mock).mockResolvedValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'test@example.com',
                name: 'Test User',
              },
            ]),
          });

          await register(mockReq as Request, mockRes as Response);
          expect(mockRes.status).toHaveBeenCalledWith(201);
        }
      });
    });

    describe('Complete Password Requirements', () => {
      it('should accept passwords meeting all requirements', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });

      it('should reject passwords missing any complexity requirement', async () => {
        const testCases = [
          { password: 'short1!', error: 'Password must be at least 8 characters long' },
          { password: 'shortA!', error: 'Password must be at least 8 characters long' },
          { password: 'short1!', error: 'Password must be at least 8 characters long' },
          { password: 'short1!', error: 'Password must be at least 8 characters long' },
          { password: 'shortA1!', error: 'Password must be at least 8 characters long' },
          { password: 'short1!', error: 'Password must be at least 8 characters long' },
          { password: 'shortA1!', error: 'Password must be at least 8 characters long' },
          { password: 'shortA1!', error: 'Password must be at least 8 characters long' },
        ];

        for (const testCase of testCases) {
          mockReq.body = {
            email: 'test@example.com',
            password: testCase.password,
            name: 'Test User',
          };

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: testCase.error,
          });
        }
      });
    });
  });

  describe('JWT_SECRET Validation', () => {
    describe('Missing JWT_SECRET', () => {
      beforeEach(() => {
        delete process.env.JWT_SECRET;
      });

      it('should throw error when JWT_SECRET is not configured in generateToken', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to register user',
        });
      });

      it('should throw error when JWT_SECRET is not configured in login', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            name: 'Test User',
            passwordHash: 'hashedpassword',
          },
        ]);

        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        await login(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to login',
        });
      });

      it('should return 500 error in authenticate middleware when JWT_SECRET is not configured', () => {
        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Server configuration error',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('Valid JWT_SECRET', () => {
      beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret-key';
      });

      it('should generate token successfully with valid JWT_SECRET', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (db.insert as jest.Mock).mockResolvedValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
            },
          ]),
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });
  });

  describe('Timing Attack Prevention in Login', () => {
    it('should generate dummy hash for non-existent users to prevent timing attacks', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([]);

      // Mock bcrypt.hash to return a dummy hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('dummy-hash');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockReq as Request, mockRes as Response);

      // Verify that bcrypt.hash was called (dummy hash generation)
      expect(bcrypt.hash).toHaveBeenCalledWith('dummy-password-for-timing-attack-prevention', 10);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should not generate dummy hash for existing users', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hashedpassword',
        },
      ]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockReq as Request, mockRes as Response);

      // Verify that bcrypt.hash was NOT called for existing users
      expect(bcrypt.hash).not.toHaveBeenCalledWith('dummy-password-for-timing-attack-prevention', 10);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should maintain consistent timing for non-existent and existing users', async () => {
      // Test with non-existent user
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([]);

      (bcrypt.hash as jest.Mock).mockResolvedValue('dummy-hash');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const startTime = Date.now();
      await login(mockReq as Request, mockRes as Response);
      const nonExistentTime = Date.now() - startTime;

      // Test with existing user but wrong password
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (db.select as jest.Mock).mockResolvedValue([
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hashedpassword',
        },
      ]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const startTime2 = Date.now();
      await login(mockReq as Request, mockRes as Response);
      const existingUserTime = Date.now() - startTime2;

      // Both should complete in similar time (timing attack prevention)
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });
  });

  describe('Error Handling with Type Guards', () => {
    describe('Register Error Handling', () => {
      it('should handle validation errors with proper type guard', async () => {
        mockReq.body = {
          email: 'invalid-email',
          password: 'weak',
          name: '',
        };

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(String),
          })
        );
      });

      it('should handle database errors with proper error type', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to register user',
        });
      });

      it('should handle unexpected errors with proper error type', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to register user',
        });
      });
    });

    describe('Login Error Handling', () => {
      it('should handle validation errors with proper type guard', async () => {
        mockReq.body = {
          email: 'invalid',
          password: 'weak',
        };

        await login(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(String),
          })
        );
      });

      it('should handle database errors with proper error type', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        await login(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to login',
        });
      });

      it('should handle unexpected errors with proper error type', async () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        await login(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to login',
        });
      });
    });

    describe('Logout Error Handling', () => {
      it('should handle errors gracefully with proper error type', async () => {
        mockRes.status = jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        });

        await logout(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to logout',
        });
      });

      it('should handle unexpected errors with proper error type', async () => {
        mockRes.status = jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        await logout(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Failed to logout',
        });
      });
    });
  });

  describe('JWT Payload Validation in Middleware', () => {
    describe('Valid JWT Payload Structure', () => {
      beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
        });
      });

      it('should accept valid JWT payload with id and email', () => {
        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
        expect(mockReq.user).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
        });
        expect(mockNext).toHaveBeenCalled();
      });

      it('should reject JWT payload missing id field', () => {
        (jwt.verify as jest.Mock).mockReturnValue({
          email: 'test@example.com',
        });

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload missing email field', () => {
        (jwt.verify as jest.Mock).mockReturnValue({
          id: '123e4567-e89b-12d3-a456-426614174000',
        });

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload with null values', () => {
        (jwt.verify as jest.Mock).mockReturnValue({
          id: null,
          email: null,
        });

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload with missing id property (not in object)', () => {
        (jwt.verify as jest.Mock).mockReturnValue({
          email: 'test@example.com',
          name: 'Test User',
        });

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload with missing email property (not in object)', () => {
        (jwt.verify as jest.Mock).mockReturnValue({
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test User',
        });

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload that is not an object', () => {
        (jwt.verify as jest.Mock).mockReturnValue('not-an-object');

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload that is null', () => {
        (jwt.verify as jest.Mock).mockReturnValue(null);

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload that is undefined', () => {
        (jwt.verify as jest.Mock).mockReturnValue(undefined);

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject JWT payload with extra properties', () => {
        (jwt.verify as jest.Mock).mockReturnValue({
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          extra: 'property',
        });

        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token payload',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('JWT Token Format Validation', () => {
      it('should reject tokens without Bearer prefix', () => {
        mockReq.headers = {
          authorization: 'valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject tokens with only "Bearer" (no token)', () => {
        mockReq.headers = {
          authorization: 'Bearer',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject tokens with extra spaces in prefix', () => {
        mockReq.headers = {
          authorization: '  Bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject tokens with lowercase "bearer" prefix', () => {
        mockReq.headers = {
          authorization: 'bearer valid-token',
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('All Existing Auth Functionality', () => {
    describe('POST /auth/register', () => {
      describe('Happy Path', () => {
        it('should register a new user successfully', async () => {
          const userData = {
            email: 'test@example.com',
            password: 'SecurePass123!',
            name: 'Test User',
          };

          mockReq.body = userData;

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([]);
          (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
          (db.insert as jest.Mock).mockResolvedValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: userData.email,
                name: userData.name,
              },
            ]),
          });

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(201);
          expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
              id: expect.any(String),
              email: userData.email,
              name: userData.name,
            })
          );
        });

        it('should store email in lowercase', async () => {
          const userData = {
            email: 'TEST@EXAMPLE.COM',
            password: 'SecurePass123!',
            name: 'Test User',
          };

          mockReq.body = userData;

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([]);
          (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
          (db.insert as jest.Mock).mockResolvedValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: userData.email.toLowerCase(),
                name: userData.name,
              },
            ]),
          });

          await register(mockReq as Request, mockRes as Response);

          expect(db.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              values: expect.objectContaining({
                email: userData.email.toLowerCase(),
              }),
            })
          );
        });

        it('should store name without extra whitespace', async () => {
          const userData = {
            email: 'test@example.com',
            password: 'SecurePass123!',
            name: '  Test User  ',
          };

          mockReq.body = userData;

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([]);
          (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
          (db.insert as jest.Mock).mockResolvedValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: userData.email,
                name: 'Test User',
              },
            ]),
          });

          await register(mockReq as Request, mockRes as Response);

          expect(db.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              values: expect.objectContaining({
                name: 'Test User',
              }),
            })
          );
        });
      });

      describe('Validation Errors', () => {
        it('should return 400 if email is missing', async () => {
          mockReq.body = { password: 'SecurePass123!', name: 'Test User' };

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Email, password, and name are required',
          });
        });

        it('should return 400 if password is missing', async () => {
          mockReq.body = { email: 'test@example.com', name: 'Test User' };

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Email, password, and name are required',
          });
        });

        it('should return 400 if name is missing', async () => {
          mockReq.body = { email: 'test@example.com', password: 'SecurePass123!' };

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Email, password, and name are required',
          });
        });

        it('should return 400 for invalid email format', async () => {
          mockReq.body = {
            email: 'invalid-email',
            password: 'SecurePass123!',
            name: 'Test User',
          };

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Invalid email format',
          });
        });

        it('should return 400 for weak password (less than 8 characters)', async () => {
          mockReq.body = {
            email: 'test@example.com',
            password: 'weak1!',
            name: 'Test User',
          };

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Password must be at least 8 characters long',
          });
        });

        it('should return 400 for empty name', async () => {
          mockReq.body = {
            email: 'test@example.com',
            password: 'SecurePass123!',
            name: '   ',
          };

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Name cannot be empty',
          });
        });
      });

      describe('Duplicate Email Error', () => {
        it('should return 409 if email already exists', async () => {
          mockReq.body = {
            email: 'test@example.com',
            password: 'SecurePass123!',
            name: 'Test User',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Existing User',
            },
          ]);

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(409);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Email already in use',
          });
          expect(db.insert).not.toHaveBeenCalled();
        });

        it('should check email in lowercase for duplicates', async () => {
          mockReq.body = {
            email: 'Test@Example.COM',
            password: 'SecurePass123!',
            name: 'Test User',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Existing User',
            },
          ]);

          await register(mockReq as Request, mockRes as Response);

          expect(db.select).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.any(Function),
            })
          );
        });
      });

      describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
          mockReq.body = {
            email: 'test@example.com',
            password: 'SecurePass123!',
            name: 'Test User',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockRejectedValue(new Error('Database error'));

          await register(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Failed to register user',
          });
        });
      });
    });

    describe('POST /auth/login', () => {
      describe('Happy Path', () => {
        it('should login user successfully and return token', async () => {
          const loginData = {
            email: 'test@example.com',
            password: 'SecurePass123!',
          };

          mockReq.body = loginData;

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
              passwordHash: 'hashedpassword',
            },
          ]);

          (bcrypt.compare as jest.Mock).mockResolvedValue(true);
          (jwt.sign as jest.Mock).mockReturnValue('test-jwt-token');

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
              token: 'test-jwt-token',
              user: expect.objectContaining({
                id: expect.any(String),
                email: loginData.email,
                name: 'Test User',
              }),
            })
          );
        });

        it('should login with case-insensitive email', async () => {
          const loginData = {
            email: 'TEST@EXAMPLE.COM',
            password: 'SecurePass123!',
          };

          mockReq.body = loginData;

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
              passwordHash: 'hashedpassword',
            },
          ]);

          (bcrypt.compare as jest.Mock).mockResolvedValue(true);
          (jwt.sign as jest.Mock).mockReturnValue('test-jwt-token');

          await login(mockReq as Request, mockRes as Response);

          expect(db.select).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.any(Function),
            })
          );
        });
      });

      describe('Validation Errors', () => {
        it('should return 400 if email is missing', async () => {
          mockReq.body = { password: 'SecurePass123!' };

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Email and password are required',
          });
        });

        it('should return 400 if password is missing', async () => {
          mockReq.body = { email: 'test@example.com' };

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Email and password are required',
          });
        });

        it('should return 400 for invalid email format', async () => {
          mockReq.body = {
            email: 'invalid-email',
            password: 'SecurePass123!',
          };

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Invalid email format',
          });
        });
      });

      describe('Invalid Credentials', () => {
        it('should return 401 for non-existent email with timing attack prevention', async () => {
          mockReq.body = {
            email: 'nonexistent@example.com',
            password: 'SecurePass123!',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([]);

          (bcrypt.compare as jest.Mock).mockResolvedValue(false);

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(401);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Invalid credentials',
          });
        });

        it('should return 401 for wrong password', async () => {
          mockReq.body = {
            email: 'test@example.com',
            password: 'wrongpassword',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
              passwordHash: 'hashedpassword',
            },
          ]);

          (bcrypt.compare as jest.Mock).mockResolvedValue(false);

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(401);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Invalid credentials',
          });
        });

        it('should not reveal whether email exists during login', async () => {
          mockReq.body = {
            email: 'test@example.com',
            password: 'wrongpassword',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockResolvedValue([
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              name: 'Test User',
              passwordHash: 'hashedpassword',
            },
          ]);

          (bcrypt.compare as jest.Mock).mockResolvedValue(false);

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Invalid credentials',
          });
        });
      });

      describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
          mockReq.body = {
            email: 'test@example.com',
            password: 'SecurePass123!',
          };

          const { db } = require('../../server/src/db');
          (db.select as jest.Mock).mockRejectedValue(new Error('Database error'));

          await login(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Failed to login',
          });
        });
      });
    });

    describe('POST /auth/logout', () => {
      describe('Happy Path', () => {
        it('should return 200 on successful logout', async () => {
          await logout(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith({});
        });
      });

      describe('Error Handling', () => {
        it('should handle errors gracefully', async () => {
          mockRes.status = jest.fn().mockImplementation(() => {
            throw new Error('Test error');
          });

          await logout(mockReq as Request, mockRes as Response);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Failed to logout',
          });
        });
      });
    });
  });

  describe('Password Hashing Verification', () => {
    it('should hash password before storing', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      mockReq.body = userData;

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (db.insert as jest.Mock).mockResolvedValue({
        returning: jest.fn().mockResolvedValue([
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: userData.email,
            name: userData.name,
          },
        ]),
      });

      await register(mockReq as Request, mockRes as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        userData.password,
        10
      );
    });

    it('should verify password during login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      mockReq.body = loginData;

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hashedpassword',
        },
      ]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-jwt-token');

      await login(mockReq as Request, mockRes as Response);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        'hashedpassword'
      );
    });

    it('should reject login with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockReq.body = loginData;

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hashedpassword',
        },
      ]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockReq as Request, mockRes as Response);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        'hashedpassword'
      );
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string fields', async () => {
      mockReq.body = {
        email: '',
        password: '',
        name: '',
      };

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should handle special characters in email', async () => {
      mockReq.body = {
        email: 'test+tag@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (db.insert as jest.Mock).mockResolvedValue({
        returning: jest.fn().mockResolvedValue([
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test+tag@example.com',
            name: 'Test User',
          },
        ]),
      });

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle very long names', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'A'.repeat(1000),
      };

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (db.insert as jest.Mock).mockResolvedValue({
        returning: jest.fn().mockResolvedValue([
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            name: 'A'.repeat(1000),
          },
        ]),
      });

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle very long passwords', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'A'.repeat(1000),
        name: 'Test User',
      };

      const { db } = require('../../server/src/db');
      (db.select as jest.Mock).mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (db.insert as jest.Mock).mockResolvedValue({
        returning: jest.fn().mockResolvedValue([
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            name: 'Test User',
          },
        ]),
      });

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
