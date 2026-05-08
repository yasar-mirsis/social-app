/**
 * Test suite for Jest and Vitest configurations
 * Validates test configurations are valid and properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '..');

describe('Jest Configuration (Server)', () => {
  let jestConfig: any;

  beforeAll(() => {
    const jestPath = path.join(ROOT_DIR, 'server/jest.config.js');
    const content = fs.readFileSync(jestPath, 'utf-8');
    jestConfig = eval(content);
  });

  test('has preset', () => {
    expect(jestConfig).toHaveProperty('preset');
    expect(jestConfig.preset).toBe('ts-jest');
  });

  test('has testEnvironment', () => {
    expect(jestConfig).toHaveProperty('testEnvironment');
    expect(jestConfig.testEnvironment).toBe('node');
  });

  test('has roots', () => {
    expect(jestConfig).toHaveProperty('roots');
    expect(jestConfig.roots).toBe('<rootDir>/src');
  });

  test('has testMatch', () => {
    expect(jestConfig).toHaveProperty('testMatch');
    expect(jestConfig.testMatch).toBeInstanceOf(Array);
    expect(jestConfig.testMatch).toContain('**/__tests__/**/*.ts');
    expect(jestConfig.testMatch).toContain('**/?(*.)+(spec|test).ts');
  });

  test('has collectCoverageFrom', () => {
    expect(jestConfig).toHaveProperty('collectCoverageFrom');
    expect(jestConfig.collectCoverageFrom).toBeInstanceOf(Array);
    expect(jestConfig.collectCoverageFrom).toContain('src/**/*.ts');
    expect(jestConfig.collectCoverageFrom).toContain('!src/**/*.d.ts');
  });

  test('has moduleNameMapper', () => {
    expect(jestConfig).toHaveProperty('moduleNameMapper');
    expect(jestConfig.moduleNameMapper).toHaveProperty('^@/(.*)$');
    expect(jestConfig.moduleNameMapper['^@/(.*)$']).toBe('<rootDir>/src/$1');
  });

  test('preset is ts-jest', () => {
    expect(jestConfig.preset).toBe('ts-jest');
  });

  test('testEnvironment is node', () => {
    expect(jestConfig.testEnvironment).toBe('node');
  });

  test('roots points to src', () => {
    expect(jestConfig.roots).toBe('<rootDir>/src');
  });

  test('testMatch includes both __tests__ and spec/test files', () => {
    expect(jestConfig.testMatch).toContain('**/__tests__/**/*.ts');
    expect(jestConfig.testMatch).toContain('**/?(*.)+(spec|test).ts');
  });

  test('collectCoverageFrom includes all .ts files except .d.ts', () => {
    expect(jestConfig.collectCoverageFrom).toContain('src/**/*.ts');
    expect(jestConfig.collectCoverageFrom).toContain('!src/**/*.d.ts');
  });

  test('moduleNameMapper handles @ imports', () => {
    expect(jestConfig.moduleNameMapper).toHaveProperty('^@/(.*)$');
    expect(jestConfig.moduleNameMapper['^@/(.*)$']).toBe('<rootDir>/src/$1');
  });
});

describe('Vitest Configuration (Client)', () => {
  let vitestConfig: any;

  beforeAll(() => {
    const vitestPath = path.join(ROOT_DIR, 'client/vitest.config.ts');
    const content = fs.readFileSync(vitestPath, 'utf-8');
    // Parse the config
    vitestConfig = eval(content.replace('export default defineConfig', 'defineConfig'));
  });

  test('has plugins', () => {
    expect(vitestConfig).toHaveProperty('plugins');
    expect(vitestConfig.plugins).toBeInstanceOf(Array);
    expect(vitestConfig.plugins).toHaveLength(1);
  });

  test('has test configuration', () => {
    expect(vitestConfig).toHaveProperty('test');
    expect(vitestConfig.test).toHaveProperty('globals');
    expect(vitestConfig.test.globals).toBe(true);
  });

  test('test.globals is true', () => {
    expect(vitestConfig.test.globals).toBe(true);
  });

  test('test.environment is jsdom', () => {
    expect(vitestConfig.test.environment).toBe('jsdom');
  });

  test('test.setupFiles is defined', () => {
    expect(vitestConfig.test).toHaveProperty('setupFiles');
    expect(vitestConfig.test.setupFiles).toBe('./src/test/setup.ts');
  });

  test('has React plugin', () => {
    expect(vitestConfig.plugins[0]).toHaveProperty('name');
    expect(vitestConfig.plugins[0].name).toBe('vite:react');
  });

  test('setupFiles points to test setup', () => {
    expect(vitestConfig.test.setupFiles).toBe('./src/test/setup.ts');
  });

  test('environment is jsdom for browser testing', () => {
    expect(vitestConfig.test.environment).toBe('jsdom');
  });

  test('globals is enabled for test functions', () => {
    expect(vitestConfig.test.globals).toBe(true);
  });
});

describe('Test Configuration Files', () => {
  test('server jest.config.js exists and is valid', () => {
    const jestPath = path.join(ROOT_DIR, 'server/jest.config.js');
    expect(fs.existsSync(jestPath)).toBe(true);
    const content = fs.readFileSync(jestPath, 'utf-8');
    expect(() => eval(content)).not.toThrow();
  });

  test('client vitest.config.ts exists and is valid', () => {
    const vitestPath = path.join(ROOT_DIR, 'client/vitest.config.ts');
    expect(fs.existsSync(vitestPath)).toBe(true);
    const content = fs.readFileSync(vitestPath, 'utf-8');
    expect(content).toContain('export default defineConfig');
    expect(content).toContain('test');
    expect(content).toContain('setupFiles');
  });
});

describe('Test Configuration Consistency', () => {
  test('server uses ts-jest preset', () => {
    const jestPath = path.join(ROOT_DIR, 'server/jest.config.js');
    const jestConfig = JSON.parse(fs.readFileSync(jestPath, 'utf-8'));
    expect(jestConfig.preset).toBe('ts-jest');
  });

  test('client uses jsdom environment', () => {
    const vitestPath = path.join(ROOT_DIR, 'client/vitest.config.ts');
    const vitestConfig = JSON.parse(fs.readFileSync(vitestPath, 'utf-8'));
    expect(vitestConfig.test.environment).toBe('jsdom');
  });

  test('client test setup file exists', () => {
    const setupPath = path.join(ROOT_DIR, 'client/src/test/setup.ts');
    expect(fs.existsSync(setupPath)).toBe(true);
    const content = fs.readFileSync(setupPath, 'utf-8');
    expect(content).toContain('@testing-library/jest-dom');
  });
});
