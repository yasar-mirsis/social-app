/**
 * Test suite for package.json files
 * Validates structure, scripts, and dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '..');

describe('package.json Files', () => {
  describe('Root package.json', () => {
    let rootPackage: any;

    beforeAll(() => {
      const packagePath = path.join(ROOT_DIR, 'package.json');
      rootPackage = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    });

    test('has required fields', () => {
      expect(rootPackage).toHaveProperty('name');
      expect(rootPackage).toHaveProperty('version');
      expect(rootPackage).toHaveProperty('description');
      expect(rootPackage).toHaveProperty('private');
      expect(rootPackage).toHaveProperty('workspaces');
      expect(rootPackage).toHaveProperty('scripts');
      expect(rootPackage).toHaveProperty('devDependencies');
      expect(rootPackage).toHaveProperty('engines');
    });

    test('name is correct', () => {
      expect(rootPackage.name).toBe('social-app');
    });

    test('version is valid semver', () => {
      expect(rootPackage.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('private is true', () => {
      expect(rootPackage.private).toBe(true);
    });

    test('workspaces includes server and client', () => {
      expect(rootPackage.workspaces).toEqual(['server', 'client']);
    });

    test('has all required scripts', () => {
      const scripts = rootPackage.scripts;
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('dev:server');
      expect(scripts).toHaveProperty('dev:client');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('build:server');
      expect(scripts).toHaveProperty('build:client');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('format');
    });

    test('dev script runs both server and client', () => {
      expect(rootPackage.scripts.dev).toBe(
        'concurrently "npm run dev:server" "npm run dev:client"'
      );
    });

    test('dev:server script uses workspace', () => {
      expect(rootPackage.scripts.dev:server).toBe(
        'npm run dev --workspace=server'
      );
    });

    test('dev:client script uses workspace', () => {
      expect(rootPackage.scripts.dev:client).toBe(
        'npm run dev --workspace=client'
      );
    });

    test('build script uses workspaces', () => {
      expect(rootPackage.scripts.build).toBe('npm run build --workspaces');
    });

    test('has devDependencies', () => {
      expect(rootPackage.devDependencies).toHaveProperty('concurrently');
      expect(rootPackage.devDependencies).toHaveProperty('typescript');
      expect(rootPackage.devDependencies).toHaveProperty('prettier');
    });

    test('concurrently version is valid semver', () => {
      const version = rootPackage.devDependencies.concurrently;
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('typescript version is valid semver', () => {
      const version = rootPackage.devDependencies.typescript;
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('engines specify Node and npm versions', () => {
      expect(rootPackage.engines).toHaveProperty('node');
      expect(rootPackage.engines).toHaveProperty('npm');
      expect(rootPackage.engines.node).toBe('>=18.0.0');
      expect(rootPackage.engines.npm).toBe('>=9.0.0');
    });
  });

  describe('Server package.json', () => {
    let serverPackage: any;

    beforeAll(() => {
      const packagePath = path.join(ROOT_DIR, 'server/package.json');
      serverPackage = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    });

    test('has required fields', () => {
      expect(serverPackage).toHaveProperty('name');
      expect(serverPackage).toHaveProperty('version');
      expect(serverPackage).toHaveProperty('description');
      expect(serverPackage).toHaveProperty('main');
      expect(serverPackage).toHaveProperty('scripts');
      expect(serverPackage).toHaveProperty('dependencies');
      expect(serverPackage).toHaveProperty('devDependencies');
      expect(serverPackage).toHaveProperty('engines');
    });

    test('name is correct', () => {
      expect(serverPackage.name).toBe('social-app-server');
    });

    test('main points to dist/index.js', () => {
      expect(serverPackage.main).toBe('dist/index.js');
    });

    test('has all required scripts', () => {
      const scripts = serverPackage.scripts;
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('test');
    });

    test('dev script uses ts-node-dev', () => {
      expect(serverPackage.scripts.dev).toContain('ts-node-dev');
    });

    test('build script uses tsc', () => {
      expect(serverPackage.scripts.build).toBe('tsc');
    });

    test('has all required dependencies', () => {
      const deps = serverPackage.dependencies;
      expect(deps).toHaveProperty('express');
      expect(deps).toHaveProperty('cors');
      expect(deps).toHaveProperty('dotenv');
      expect(deps).toHaveProperty('bcryptjs');
      expect(deps).toHaveProperty('jsonwebtoken');
      expect(deps).toHaveProperty('@prisma/client');
      expect(deps).toHaveProperty('express-validator');
    });

    test('express version is valid semver', () => {
      const version = serverPackage.dependencies.express;
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('has all required devDependencies', () => {
      const devDeps = serverPackage.devDependencies;
      expect(devDeps).toHaveProperty('@types/express');
      expect(devDeps).toHaveProperty('@types/cors');
      expect(devDeps).toHaveProperty('@types/bcryptjs');
      expect(devDeps).toHaveProperty('@types/jsonwebtoken');
      expect(devDeps).toHaveProperty('@types/node');
      expect(devDeps).toHaveProperty('typescript');
      expect(devDeps).toHaveProperty('ts-node-dev');
      expect(devDeps).toHaveProperty('prisma');
      expect(devDeps).toHaveProperty('@typescript-eslint/eslint-plugin');
      expect(devDeps).toHaveProperty('@typescript-eslint/parser');
      expect(devDeps).toHaveProperty('eslint');
      expect(devDeps).toHaveProperty('jest');
      expect(devDeps).toHaveProperty('@types/jest');
      expect(devDeps).toHaveProperty('ts-jest');
      expect(devDeps).toHaveProperty('prettier');
    });

    test('jest is in devDependencies', () => {
      expect(serverPackage.devDependencies).toHaveProperty('jest');
    });

    test('ts-jest is in devDependencies', () => {
      expect(serverPackage.devDependencies).toHaveProperty('ts-jest');
    });

    test('engines specify Node version', () => {
      expect(serverPackage.engines.node).toBe('>=18.0.0');
    });
  });

  describe('Client package.json', () => {
    let clientPackage: any;

    beforeAll(() => {
      const packagePath = path.join(ROOT_DIR, 'client/package.json');
      clientPackage = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    });

    test('has required fields', () => {
      expect(clientPackage).toHaveProperty('name');
      expect(clientPackage).toHaveProperty('version');
      expect(clientPackage).toHaveProperty('description');
      expect(clientPackage).toHaveProperty('type');
      expect(clientPackage).toHaveProperty('scripts');
      expect(clientPackage).toHaveProperty('dependencies');
      expect(clientPackage).toHaveProperty('devDependencies');
      expect(clientPackage).toHaveProperty('engines');
    });

    test('name is correct', () => {
      expect(clientPackage.name).toBe('social-app-client');
    });

    test('type is module', () => {
      expect(clientPackage.type).toBe('module');
    });

    test('has all required scripts', () => {
      const scripts = clientPackage.scripts;
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('preview');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('test');
    });

    test('dev script uses vite', () => {
      expect(clientPackage.scripts.dev).toBe('vite');
    });

    test('build script uses tsc and vite build', () => {
      expect(clientPackage.scripts.build).toBe('tsc && vite build');
    });

    test('preview script uses vite preview', () => {
      expect(clientPackage.scripts.preview).toBe('vite preview');
    });

    test('has all required dependencies', () => {
      const deps = clientPackage.dependencies;
      expect(deps).toHaveProperty('react');
      expect(deps).toHaveProperty('react-dom');
      expect(deps).toHaveProperty('react-router-dom');
      expect(deps).toHaveProperty('axios');
    });

    test('react version is valid semver', () => {
      const version = clientPackage.dependencies.react;
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('has all required devDependencies', () => {
      const devDeps = clientPackage.devDependencies;
      expect(devDeps).toHaveProperty('@types/react');
      expect(devDeps).toHaveProperty('@types/react-dom');
      expect(devDeps).toHaveProperty('@typescript-eslint/eslint-plugin');
      expect(devDeps).toHaveProperty('@typescript-eslint/parser');
      expect(devDeps).toHaveProperty('@vitejs/plugin-react');
      expect(devDeps).toHaveProperty('typescript');
      expect(devDeps).toHaveProperty('vite');
      expect(devDeps).toHaveProperty('eslint');
      expect(devDeps).toHaveProperty('eslint-plugin-react-hooks');
      expect(devDeps).toHaveProperty('eslint-plugin-react-refresh');
      expect(devDeps).toHaveProperty('vitest');
      expect(devDeps).toHaveProperty('@testing-library/react');
      expect(devDeps).toHaveProperty('@testing-library/jest-dom');
      expect(devDeps).toHaveProperty('@testing-library/user-event');
      expect(devDeps).toHaveProperty('jsdom');
      expect(devDeps).toHaveProperty('prettier');
    });

    test('vitest is in devDependencies', () => {
      expect(clientPackage.devDependencies).toHaveProperty('vitest');
    });

    test('jsdom is in devDependencies', () => {
      expect(clientPackage.devDependencies).toHaveProperty('jsdom');
    });

    test('engines specify Node version', () => {
      expect(clientPackage.engines.node).toBe('>=18.0.0');
    });
  });
});
