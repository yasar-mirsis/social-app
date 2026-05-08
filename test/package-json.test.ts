/**
 * Package.json Validation Tests
 *
 * Tests that verify package.json files have correct structure and required fields.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Package.json Validation', () => {
  const rootPackagePath = path.join(__dirname, '../../package.json');
  const serverPackagePath = path.join(__dirname, '../../server/package.json');
  const clientPackagePath = path.join(__dirname, '../../client/package.json');

  describe('Root package.json', () => {
    it('should exist', () => {
      expect(fs.existsSync(rootPackagePath)).toBe(true);
    });

    it('should be a valid JSON file', () => {
      const content = fs.readFileSync(rootPackagePath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have required fields', () => {
      const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('version');
      expect(pkg).toHaveProperty('description');
      expect(pkg).toHaveProperty('private');
      expect(pkg).toHaveProperty('workspaces');
      expect(pkg).toHaveProperty('scripts');
      expect(pkg).toHaveProperty('devDependencies');
      expect(pkg).toHaveProperty('engines');
    });

    it('should have valid workspace configuration', () => {
      const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
      expect(pkg.workspaces).toBeInstanceOf(Array);
      expect(pkg.workspaces).toContain('server');
      expect(pkg.workspaces).toContain('client');
    });

    it('should have required scripts', () => {
      const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
      const scripts = pkg.scripts;

      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('lint');
    });

    it('should have workspace-specific scripts', () => {
      const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
      const scripts = pkg.scripts;

      expect(scripts).toHaveProperty('dev:server');
      expect(scripts).toHaveProperty('dev:client');
      expect(scripts).toHaveProperty('build:server');
      expect(scripts).toHaveProperty('build:client');
      expect(scripts).toHaveProperty('start:server');
    });

    it('should have correct dependencies', () => {
      const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
      const deps = pkg.devDependencies;

      expect(deps).toHaveProperty('concurrently');
      expect(deps).toHaveProperty('typescript');
    });

    it('should have correct engine requirements', () => {
      const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
      const engines = pkg.engines;

      expect(engines).toHaveProperty('node');
      expect(engines).toHaveProperty('npm');
      expect(engines.node).toBe('>=18.0.0');
      expect(engines.npm).toBe('>=9.0.0');
    });
  });

  describe('Server package.json', () => {
    it('should exist', () => {
      expect(fs.existsSync(serverPackagePath)).toBe(true);
    });

    it('should be a valid JSON file', () => {
      const content = fs.readFileSync(serverPackagePath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have required fields', () => {
      const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf-8'));
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('version');
      expect(pkg).toHaveProperty('description');
      expect(pkg).toHaveProperty('main');
      expect(pkg).toHaveProperty('scripts');
      expect(pkg).toHaveProperty('dependencies');
      expect(pkg).toHaveProperty('devDependencies');
      expect(pkg).toHaveProperty('engines');
    });

    it('should have correct name', () => {
      const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf-8'));
      expect(pkg.name).toBe('social-app-server');
    });

    it('should have correct main entry point', () => {
      const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf-8'));
      expect(pkg.main).toBe('dist/index.js');
    });

    it('should have required scripts', () => {
      const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf-8'));
      const scripts = pkg.scripts;

      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('test');
    });

    it('should have required dependencies', () => {
      const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf-8'));
      const deps = pkg.dependencies;

      expect(deps).toHaveProperty('express');
      expect(deps).toHaveProperty('cors');
      expect(deps).toHaveProperty('dotenv');
      expect(deps).toHaveProperty('jsonwebtoken');
      expect(deps).toHaveProperty('bcryptjs');
      expect(deps).toHaveProperty('helmet');
      expect(deps).toHaveProperty('express-validator');
      expect(deps).toHaveProperty('prisma');
      expect(deps).toHaveProperty('@prisma/client');
    });

    it('should have required devDependencies', () => {
      const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf-8'));
      const deps = pkg.devDependencies;

      expect(deps).toHaveProperty('@types/express');
      expect(deps).toHaveProperty('@types/cors');
      expect(deps).toHaveProperty('@types/jsonwebtoken');
      expect(deps).toHaveProperty('@types/bcryptjs');
      expect(deps).toHaveProperty('@types/node');
      expect(deps).toHaveProperty('typescript');
      expect(deps).toHaveProperty('ts-node-dev');
      expect(deps).toHaveProperty('eslint');
      expect(deps).toHaveProperty('jest');
      expect(deps).toHaveProperty('@types/jest');
      expect(deps).toHaveProperty('ts-jest');
    });

    it('should have correct engine requirements', () => {
      const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf-8'));
      const engines = pkg.engines;

      expect(engines).toHaveProperty('node');
      expect(engines).toHaveProperty('npm');
      expect(engines.node).toBe('>=18.0.0');
      expect(engines.npm).toBe('>=9.0.0');
    });
  });

  describe('Client package.json', () => {
    it('should exist', () => {
      expect(fs.existsSync(clientPackagePath)).toBe(true);
    });

    it('should be a valid JSON file', () => {
      const content = fs.readFileSync(clientPackagePath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have required fields', () => {
      const pkg = JSON.parse(fs.readFileSync(clientPackagePath, 'utf-8'));
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('version');
      expect(pkg).toHaveProperty('description');
      expect(pkg).toHaveProperty('scripts');
      expect(pkg).toHaveProperty('dependencies');
      expect(pkg).toHaveProperty('devDependencies');
      expect(pkg).toHaveProperty('engines');
    });

    it('should have correct name', () => {
      const pkg = JSON.parse(fs.readFileSync(clientPackagePath, 'utf-8'));
      expect(pkg.name).toBe('social-app-client');
    });

    it('should have required scripts', () => {
      const pkg = JSON.parse(fs.readFileSync(clientPackagePath, 'utf-8'));
      const scripts = pkg.scripts;

      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('preview');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('test');
    });

    it('should have required dependencies', () => {
      const pkg = JSON.parse(fs.readFileSync(clientPackagePath, 'utf-8'));
      const deps = pkg.dependencies;

      expect(deps).toHaveProperty('react');
      expect(deps).toHaveProperty('react-dom');
      expect(deps).toHaveProperty('react-router-dom');
      expect(deps).toHaveProperty('axios');
    });

    it('should have required devDependencies', () => {
      const pkg = JSON.parse(fs.readFileSync(clientPackagePath, 'utf-8'));
      const deps = pkg.devDependencies;

      expect(deps).toHaveProperty('@types/react');
      expect(deps).toHaveProperty('@types/react-dom');
      expect(deps).toHaveProperty('@vitejs/plugin-react');
      expect(deps).toHaveProperty('typescript');
      expect(deps).toHaveProperty('vite');
      expect(deps).toHaveProperty('eslint');
      expect(deps).toHaveProperty('eslint-plugin-react');
      expect(deps).toHaveProperty('eslint-plugin-react-hooks');
      expect(deps).toHaveProperty('vitest');
      expect(deps).toHaveProperty('@testing-library/react');
      expect(deps).toHaveProperty('@testing-library/jest-dom');
      expect(deps).toHaveProperty('@testing-library/user-event');
    });

    it('should have correct engine requirements', () => {
      const pkg = JSON.parse(fs.readFileSync(clientPackagePath, 'utf-8'));
      const engines = pkg.engines;

      expect(engines).toHaveProperty('node');
      expect(engines).toHaveProperty('npm');
      expect(engines.node).toBe('>=18.0.0');
      expect(engines.npm).toBe('>=9.0.0');
    });
  });
});
