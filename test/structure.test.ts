/**
 * Test suite for project structure and configuration files
 * Validates that all required configuration files exist and are valid
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration files that must exist
const REQUIRED_CONFIG_FILES = [
  // Root config
  'package.json',
  'tsconfig.json',
  '.env.example',
  '.prettierrc',
  // Server config
  'server/package.json',
  'server/tsconfig.json',
  'server/.eslintrc.js',
  'server/jest.config.js',
  'server/src/index.ts',
  // Client config
  'client/package.json',
  'client/tsconfig.json',
  'client/tsconfig.node.json',
  'client/vite.config.ts',
  'client/vitest.config.ts',
  'client/index.html',
  'client/src/index.tsx',
  'client/src/App.tsx',
  'client/src/index.css',
  'client/src/test/setup.ts',
  // Client ESLint
  'client/.eslintrc.js',
];

describe('Project Structure', () => {
  describe('Configuration Files Exist', () => {
    test('all required configuration files exist', () => {
      REQUIRED_CONFIG_FILES.forEach((filePath) => {
        const fullPath = path.join(ROOT_DIR, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    test('package.json files are valid JSON', () => {
      const packageJsonFiles = [
        path.join(ROOT_DIR, 'package.json'),
        path.join(ROOT_DIR, 'server/package.json'),
        path.join(ROOT_DIR, 'client/package.json'),
      ];

      packageJsonFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();
      });
    });

    test('tsconfig.json files are valid JSON', () => {
      const tsConfigFiles = [
        path.join(ROOT_DIR, 'tsconfig.json'),
        path.join(ROOT_DIR, 'server/tsconfig.json'),
        path.join(ROOT_DIR, 'client/tsconfig.json'),
        path.join(ROOT_DIR, 'client/tsconfig.node.json'),
      ];

      tsConfigFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();
      });
    });

    test('.env.example is valid', () => {
      const envPath = path.join(ROOT_DIR, '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('.prettierrc is valid', () => {
      const prettierPath = path.join(ROOT_DIR, '.prettierrc');
      const content = fs.readFileSync(prettierPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('ESLint configs are valid JavaScript', () => {
      const eslintFiles = [
        path.join(ROOT_DIR, 'server/.eslintrc.js'),
        path.join(ROOT_DIR, 'client/.eslintrc.js'),
      ];

      eslintFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Basic syntax check - should be valid JavaScript
        expect(() => eval(content)).not.toThrow();
      });
    });

    test('Jest config is valid JavaScript', () => {
      const jestPath = path.join(ROOT_DIR, 'server/jest.config.js');
      const content = fs.readFileSync(jestPath, 'utf-8');
      expect(() => eval(content)).not.toThrow();
    });

    test('Vitest config is valid TypeScript', () => {
      const vitestPath = path.join(ROOT_DIR, 'client/vitest.config.ts');
      const content = fs.readFileSync(vitestPath, 'utf-8');
      // Basic syntax check for TypeScript
      expect(content).toContain('export default defineConfig');
    });
  });

  describe('Source Files Exist', () => {
    test('server source files exist', () => {
      const serverSourceFiles = [
        path.join(ROOT_DIR, 'server/src/index.ts'),
      ];

      serverSourceFiles.forEach((filePath) => {
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('client source files exist', () => {
      const clientSourceFiles = [
        path.join(ROOT_DIR, 'client/src/index.tsx'),
        path.join(ROOT_DIR, 'client/src/App.tsx'),
        path.join(ROOT_DIR, 'client/src/index.css'),
        path.join(ROOT_DIR, 'client/src/test/setup.ts'),
      ];

      clientSourceFiles.forEach((filePath) => {
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Directory Structure', () => {
    test('server directory exists', () => {
      const serverDir = path.join(ROOT_DIR, 'server');
      expect(fs.existsSync(serverDir)).toBe(true);
      expect(fs.statSync(serverDir).isDirectory()).toBe(true);
    });

    test('client directory exists', () => {
      const clientDir = path.join(ROOT_DIR, 'client');
      expect(fs.existsSync(clientDir)).toBe(true);
      expect(fs.statSync(clientDir).isDirectory()).toBe(true);
    });

    test('server/src directory exists', () => {
      const srcDir = path.join(ROOT_DIR, 'server/src');
      expect(fs.existsSync(srcDir)).toBe(true);
      expect(fs.statSync(srcDir).isDirectory()).toBe(true);
    });

    test('client/src directory exists', () => {
      const srcDir = path.join(ROOT_DIR, 'client/src');
      expect(fs.existsSync(srcDir)).toBe(true);
      expect(fs.statSync(srcDir).isDirectory()).toBe(true);
    });

    test('client/src/test directory exists', () => {
      const testDir = path.join(ROOT_DIR, 'client/src/test');
      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.statSync(testDir).isDirectory()).toBe(true);
    });
  });
});
