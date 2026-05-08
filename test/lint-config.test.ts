/**
 * Test suite for ESLint configurations
 * Validates ESLint configs are valid and properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '..');

describe('ESLint Configurations', () => {
  describe('Server .eslintrc.js', () => {
    let serverEslint: any;

    beforeAll(() => {
      const eslintPath = path.join(ROOT_DIR, 'server/.eslintrc.js');
      const content = fs.readFileSync(eslintPath, 'utf-8');
      serverEslint = eval(content);
    });

    test('has parser', () => {
      expect(serverEslint).toHaveProperty('parser');
      expect(serverEslint.parser).toBe('@typescript-eslint/parser');
    });

    test('has extends', () => {
      expect(serverEslint).toHaveProperty('extends');
      expect(serverEslint.extends).toBeInstanceOf(Array);
      expect(serverEslint.extends).toContain('eslint:recommended');
      expect(serverEslint.extends).toContain('plugin:@typescript-eslint/recommended');
    });

    test('has plugins', () => {
      expect(serverEslint).toHaveProperty('plugins');
      expect(serverEslint.plugins).toContain('@typescript-eslint');
    });

    test('has env', () => {
      expect(serverEslint).toHaveProperty('env');
      expect(serverEslint.env).toHaveProperty('node');
      expect(serverEslint.env.node).toBe(true);
      expect(serverEslint.env).toHaveProperty('es6');
      expect(serverEslint.env.es6).toBe(true);
    });

    test('has parserOptions', () => {
      expect(serverEslint).toHaveProperty('parserOptions');
      expect(serverEslint.parserOptions).toHaveProperty('ecmaVersion');
      expect(serverEslint.parserOptions).toHaveProperty('sourceType');
      expect(serverEslint.parserOptions.ecmaVersion).toBe(2022);
      expect(serverEslint.parserOptions.sourceType).toBe('module');
    });

    test('has rules', () => {
      expect(serverEslint).toHaveProperty('rules');
      expect(serverEslint.rules).toHaveProperty('@typescript-eslint/no-unused-vars');
      expect(serverEslint.rules).toHaveProperty('@typescript-eslint/explicit-function-return-type');
      expect(serverEslint.rules).toHaveProperty('@typescript-eslint/no-explicit-any');
    });

    test('no-unused-vars has argsIgnorePattern', () => {
      const rule = serverEslint.rules['@typescript-eslint/no-unused-vars'];
      expect(rule).toBeInstanceOf(Array);
      expect(rule[1]).toHaveProperty('argsIgnorePattern');
      expect(rule[1].argsIgnorePattern).toBe('^_');
    });

    test('explicit-function-return-type is off', () => {
      const rule = serverEslint.rules['@typescript-eslint/explicit-function-return-type'];
      expect(rule).toBe('off');
    });

    test('no-explicit-any is warn', () => {
      const rule = serverEslint.rules['@typescript-eslint/no-explicit-any'];
      expect(rule).toBe('warn');
    });
  });

  describe('Client .eslintrc.js', () => {
    let clientEslint: any;

    beforeAll(() => {
      const eslintPath = path.join(ROOT_DIR, 'client/.eslintrc.js');
      const content = fs.readFileSync(eslintPath, 'utf-8');
      clientEslint = eval(content);
    });

    test('has parser', () => {
      expect(clientEslint).toHaveProperty('parser');
      expect(clientEslint.parser).toBe('@typescript-eslint/parser');
    });

    test('has extends', () => {
      expect(clientEslint).toHaveProperty('extends');
      expect(clientEslint.extends).toBeInstanceOf(Array);
      expect(clientEslint.extends).toContain('eslint:recommended');
      expect(clientEslint.extends).toContain('plugin:@typescript-eslint/recommended');
      expect(clientEslint.extends).toContain('plugin:react-hooks/recommended');
      expect(clientEslint.extends).toContain('plugin:react/jsx-runtime');
    });

    test('has plugins', () => {
      expect(clientEslint).toHaveProperty('plugins');
      expect(clientEslint.plugins).toContain('@typescript-eslint');
      expect(clientEslint.plugins).toContain('react-refresh');
    });

    test('has env', () => {
      expect(clientEslint).toHaveProperty('env');
      expect(clientEslint.env).toHaveProperty('browser');
      expect(clientEslint.env.browser).toBe(true);
      expect(clientEslint.env).toHaveProperty('es6');
      expect(clientEslint.env.es6).toBe(true);
    });

    test('has parserOptions', () => {
      expect(clientEslint).toHaveProperty('parserOptions');
      expect(clientEslint.parserOptions).toHaveProperty('ecmaVersion');
      expect(clientEslint.parserOptions).toHaveProperty('sourceType');
      expect(clientEslint.parserOptions).toHaveProperty('ecmaFeatures');
      expect(clientEslint.parserOptions.ecmaVersion).toBe(2022);
      expect(clientEslint.parserOptions.sourceType).toBe('module');
      expect(clientEslint.parserOptions.ecmaFeatures).toHaveProperty('jsx');
      expect(clientEslint.parserOptions.ecmaFeatures.jsx).toBe(true);
    });

    test('has settings for React', () => {
      expect(clientEslint).toHaveProperty('settings');
      expect(clientEslint.settings).toHaveProperty('react');
      expect(clientEslint.settings.react).toHaveProperty('version');
      expect(clientEslint.settings.react.version).toBe('detect');
    });

    test('has rules', () => {
      expect(clientEslint).toHaveProperty('rules');
      expect(clientEslint.rules).toHaveProperty('react-refresh/only-export-components');
      expect(clientEslint.rules).toHaveProperty('@typescript-eslint/no-unused-vars');
      expect(clientEslint.rules).toHaveProperty('@typescript-eslint/no-explicit-any');
    });

    test('react-refresh/only-export-components is warn', () => {
      const rule = clientEslint.rules['react-refresh/only-export-components'];
      expect(rule).toBe('warn');
    });

    test('no-unused-vars has argsIgnorePattern', () => {
      const rule = clientEslint.rules['@typescript-eslint/no-unused-vars'];
      expect(rule).toBeInstanceOf(Array);
      expect(rule[1]).toHaveProperty('argsIgnorePattern');
      expect(rule[1].argsIgnorePattern).toBe('^_');
    });

    test('no-explicit-any is warn', () => {
      const rule = clientEslint.rules['@typescript-eslint/no-explicit-any'];
      expect(rule).toBe('warn');
    });
  });

  describe('ESLint Configuration Consistency', () => {
    test('both configs use same parser', () => {
      const serverPath = path.join(ROOT_DIR, 'server/.eslintrc.js');
      const clientPath = path.join(ROOT_DIR, 'client/.eslintrc.js');

      const serverConfig = JSON.parse(fs.readFileSync(serverPath, 'utf-8'));
      const clientConfig = JSON.parse(fs.readFileSync(clientPath, 'utf-8'));

      expect(serverConfig.parser).toBe(clientConfig.parser);
      expect(serverConfig.parser).toBe('@typescript-eslint/parser');
    });

    test('both configs have no-explicit-any as warn', () => {
      const serverPath = path.join(ROOT_DIR, 'server/.eslintrc.js');
      const clientPath = path.join(ROOT_DIR, 'client/.eslintrc.js');

      const serverConfig = JSON.parse(fs.readFileSync(serverPath, 'utf-8'));
      const clientConfig = JSON.parse(fs.readFileSync(clientPath, 'utf-8'));

      expect(serverConfig.rules['@typescript-eslint/no-explicit-any']).toBe('warn');
      expect(clientConfig.rules['@typescript-eslint/no-explicit-any']).toBe('warn');
    });

    test('both configs have no-unused-vars with argsIgnorePattern', () => {
      const serverPath = path.join(ROOT_DIR, 'server/.eslintrc.js');
      const clientPath = path.join(ROOT_DIR, 'client/.eslintrc.js');

      const serverConfig = JSON.parse(fs.readFileSync(serverPath, 'utf-8'));
      const clientConfig = JSON.parse(fs.readFileSync(clientPath, 'utf-8'));

      expect(serverConfig.rules['@typescript-eslint/no-unused-vars'][1].argsIgnorePattern).toBe('^_');
      expect(clientConfig.rules['@typescript-eslint/no-unused-vars'][1].argsIgnorePattern).toBe('^_');
    });
  });

  describe('ESLint File Validation', () => {
    test('server eslint config file exists and is valid', () => {
      const eslintPath = path.join(ROOT_DIR, 'server/.eslintrc.js');
      expect(fs.existsSync(eslintPath)).toBe(true);
      const content = fs.readFileSync(eslintPath, 'utf-8');
      expect(() => eval(content)).not.toThrow();
    });

    test('client eslint config file exists and is valid', () => {
      const eslintPath = path.join(ROOT_DIR, 'client/.eslintrc.js');
      expect(fs.existsSync(eslintPath)).toBe(true);
      const content = fs.readFileSync(eslintPath, 'utf-8');
      expect(() => eval(content)).not.toThrow();
    });
  });
});
