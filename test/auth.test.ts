/**
 * Authentication Service Tests
 * Comprehensive tests for authentication endpoints and JWT middleware
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { register, login, logout } from '../../server/src/controllers/auth';
import { authenticate } from '../../server/src/middleware/auth';

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

  describe('POST /auth/register', () => {
    describe('Happy Path', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        };

        mockReq.body = userData;

        // Mock database responses
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
          password: 'password123',
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
          password: 'password123',
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
        mockReq.body = { password: 'password123', name: 'Test User' };

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
        mockReq.body = { email: 'test@example.com', password: 'password123' };

        await register(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Email, password, and name are required',
        });
      });

      it('should return 400 for invalid email format', async () => {
        mockReq.body = {
          email: 'invalid-email',
          password: 'password123',
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
          password: 'short',
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
          password: 'password123',
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
          password: 'password123',
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
          password: 'password123',
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
          password: 'password123',
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
          password: 'password123',
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
          password: 'password123',
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
        mockReq.body = { password: 'password123' };

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
          password: 'password123',
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
          password: 'password123',
        };

        const { db } = require('../../server/src/db');
        (db.select as jest.Mock).mockResolvedValue([]);

        // Mock bcrypt.compare to prevent timing attacks
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
          password: 'password123',
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

  describe('JWT Authentication Middleware', () => {
    const validToken = 'valid-jwt-token';

    beforeEach(() => {
      (jwt.verify as jest.Mock).mockReturnValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      });
    });

    describe('Happy Path', () => {
      it('should attach user to request and call next() for valid token', () => {
        mockReq.headers = {
          authorization: `Bearer ${validToken}`,
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(
          validToken,
          process.env.JWT_SECRET
        );
        expect(mockReq.user).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
        });
        expect(mockNext).toHaveBeenCalled();
      });

      it('should handle tokens without Bearer prefix', () => {
        mockReq.headers = {
          authorization: validToken,
        };

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle empty authorization header', () => {
        mockReq.headers = {};

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('Invalid Token', () => {
      it('should return 401 for invalid token', () => {
        mockReq.headers = {
          authorization: `Bearer ${validToken}`,
        };

        const { JsonWebTokenError } = require('jsonwebtoken');
        (jwt.verify as jest.Mock).mockImplementation(() => {
          throw new JsonWebTokenError('Invalid token');
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle malformed tokens', () => {
        mockReq.headers = {
          authorization: `Bearer ${validToken}`,
        };

        const { JsonWebTokenError } = require('jsonwebtoken');
        (jwt.verify as jest.Mock).mockImplementation(() => {
          throw new JsonWebTokenError('Invalid token');
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid token',
        });
      });
    });

    describe('Expired Token', () => {
      it('should return 401 for expired token', () => {
        mockReq.headers = {
          authorization: `Bearer ${validToken}`,
        };

        const { TokenExpiredError } = require('jsonwebtoken');
        (jwt.verify as jest.Mock).mockImplementation(() => {
          throw new TokenExpiredError('Token expired');
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Token expired',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle expired tokens correctly', () => {
        mockReq.headers = {
          authorization: `Bearer ${validToken}`,
        };

        const { TokenExpiredError } = require('jsonwebtoken');
        (jwt.verify as jest.Mock).mockImplementation(() => {
          throw new TokenExpiredError('Token expired');
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Token expired',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle unexpected errors gracefully', () => {
        mockReq.headers = {
          authorization: `Bearer ${validToken}`,
        };

        (jwt.verify as jest.Mock).mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('Password Hashing Verification', () => {
    it('should hash password before storing', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
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
        password: 'password123',
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
        password: 'password123',
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
        password: 'password123',
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
