/**
 * Test suite for environment variables
 * Validates .env.example contains all necessary variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '..');

describe('Environment Variables', () => {
  describe('.env.example File', () => {
    test('.env.example exists', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      expect(fs.existsSync(envPath)).toBe(true);
    });

    test('.env.example is valid', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('.env.example contains all required sections', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('# Server Configuration');
      expect(content).toContain('# Database');
      expect(content).toContain('# JWT Secret');
      expect(content).toContain('# Cloudinary');
      expect(content).toContain('# CORS');
    });
  });

  describe('Server Configuration Variables', () => {
    test('PORT is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('PORT=5000');
    });

    test('NODE_ENV is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('NODE_ENV=development');
    });

    test('PORT is a number', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const portMatch = content.match(/PORT=(\d+)/);
      expect(portMatch).not.toBeNull();
      expect(parseInt(portMatch![1])).toBeGreaterThan(0);
    });
  });

  describe('Database Variables', () => {
    test('DATABASE_URL is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('DATABASE_URL=');
    });

    test('DATABASE_URL includes postgresql://', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const dbMatch = content.match(/DATABASE_URL="([^"]+)"/);
      expect(dbMatch).not.toBeNull();
      expect(dbMatch![1]).toContain('postgresql://');
    });

    test('DATABASE_URL includes database name', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const dbMatch = content.match(/DATABASE_URL="([^"]+)"/);
      expect(dbMatch).not.toBeNull();
      expect(dbMatch![1]).toContain('social_app');
    });
  });

  describe('JWT Secret Variables', () => {
    test('JWT_SECRET is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('JWT_SECRET=');
    });

    test('JWT_SECRET has a placeholder value', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const jwtMatch = content.match(/JWT_SECRET="([^"]+)"/);
      expect(jwtMatch).not.toBeNull();
      expect(jwtMatch![1]).toBe('your-super-secret-jwt-key-change-in-production');
    });

    test('JWT_SECRET is a long string', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const jwtMatch = content.match(/JWT_SECRET="([^"]+)"/);
      expect(jwtMatch).not.toBeNull();
      expect(jwtMatch![1].length).toBeGreaterThan(20);
    });

    test('JWT_EXPIRES_IN is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('JWT_EXPIRES_IN=');
    });

    test('JWT_EXPIRES_IN has a valid duration format', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const jwtMatch = content.match(/JWT_EXPIRES_IN="([^"]+)"/);
      expect(jwtMatch).not.toBeNull();
      expect(jwtMatch![1]).toBe('7d');
    });
  });

  describe('Cloudinary Variables', () => {
    test('CLOUDINARY_CLOUD_NAME is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('CLOUDINARY_CLOUD_NAME=');
    });

    test('CLOUDINARY_CLOUD_NAME has a placeholder', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const cloudMatch = content.match(/CLOUDINARY_CLOUD_NAME="([^"]+)"/);
      expect(cloudMatch).not.toBeNull();
      expect(cloudMatch![1]).toBe('your-cloud-name');
    });

    test('CLOUDINARY_API_KEY is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('CLOUDINARY_API_KEY=');
    });

    test('CLOUDINARY_API_KEY has a placeholder', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const keyMatch = content.match(/CLOUDINARY_API_KEY="([^"]+)"/);
      expect(keyMatch).not.toBeNull();
      expect(keyMatch![1]).toBe('your-api-key');
    });

    test('CLOUDINARY_API_SECRET is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('CLOUDINARY_API_SECRET=');
    });

    test('CLOUDINARY_API_SECRET has a placeholder', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const secretMatch = content.match(/CLOUDINARY_API_SECRET="([^"]+)"/);
      expect(secretMatch).not.toBeNull();
      expect(secretMatch![1]).toBe('your-api-secret');
    });
  });

  describe('CORS Variables', () => {
    test('CLIENT_URL is defined', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('CLIENT_URL=');
    });

    test('CLIENT_URL points to localhost', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const clientMatch = content.match(/CLIENT_URL="([^"]+)"/);
      expect(clientMatch).not.toBeNull();
      expect(clientMatch![1]).toContain('localhost');
    });

    test('CLIENT_URL uses port 3000', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const clientMatch = content.match(/CLIENT_URL="([^"]+)"/);
      expect(clientMatch).not.toBeNull();
      expect(clientMatch![1]).toContain(':3000');
    });
  });

  describe('Environment Variable Completeness', () => {
    test('all required environment variables are present', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const requiredVars = [
        'PORT',
        'NODE_ENV',
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_EXPIRES_IN',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'CLIENT_URL',
      ];

      requiredVars.forEach((varName) => {
        expect(content).toContain(`${varName}=`);
      });
    });

    test('all environment variables are in quotes', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');

      const lines = content.split('\n');
      const variableLines = lines.filter((line) => line.trim().startsWith('#') === false && line.includes('='));

      variableLines.forEach((line) => {
        const firstQuoteIndex = line.indexOf('"');
        const secondQuoteIndex = line.lastIndexOf('"');
        expect(firstQuoteIndex).toBeGreaterThan(-1);
        expect(secondQuoteIndex).toBeGreaterThan(firstQuoteIndex);
      });
    });
  });
});
