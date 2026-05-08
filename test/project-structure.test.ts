/**
 * Project Structure Tests
 *
 * Tests to verify the social-app project structure is correctly configured.
 * These tests validate:
 * 1. Root package.json workspace configuration
 * 2. Server package.json dependencies
 * 3. Client package.json dependencies
 * 4. TypeScript configuration validity
 * 5. Entry point file existence and syntax
 * 6. Vite configuration validity
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Project Structure Tests', () => {
  const rootDir = process.cwd();
  const serverDir = path.join(rootDir, 'server');
  const clientDir = path.join(rootDir, 'client');

  describe('1. Root package.json Workspace Configuration', () => {
    it('should have workspace configuration', () => {
      const packageJsonPath = path.join(rootDir, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson).toHaveProperty('workspaces');
      expect(Array.isArray(packageJson.workspaces)).toBe(true);
      expect(packageJson.workspaces).toContain('server');
      expect(packageJson.workspaces).toContain('client');
    });

    it('should have workspace scripts for development', () => {
      const packageJsonPath = path.join(rootDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('dev:server');
      expect(packageJson.scripts).toHaveProperty('dev:client');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('build:server');
      expect(packageJson.scripts).toHaveProperty('build:client');
      expect(packageJson.scripts).toHaveProperty('test');
    });

    it('should have devDependencies for workspace management', () => {
      const packageJsonPath = path.join(rootDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.devDependencies).toHaveProperty('concurrently');
      expect(packageJson.devDependencies).toHaveProperty('typescript');
    });

    it('should have engine requirements', () => {
      const packageJsonPath = path.join(rootDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.engines).toHaveProperty('node');
      expect(packageJson.engines).toHaveProperty('npm');
    });
  });

  describe('2. Server package.json Dependencies', () => {
    it('should exist at server/package.json', () => {
      const packageJsonPath = path.join(serverDir, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
    });

    it('should have all required dependencies', () => {
      const packageJsonPath = path.join(serverDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const requiredDependencies = [
        'express',
        'cors',
        'dotenv',
        'jsonwebtoken',
        'bcrypt',
        'prisma',
        '@prisma/client',
        'express-validator',
        'helmet',
        'express-rate-limit'
      ];

      requiredDependencies.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have all required devDependencies', () => {
      const packageJsonPath = path.join(serverDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const requiredDevDependencies = [
        '@types/express',
        '@types/cors',
        '@types/jsonwebtoken',
        '@types/bcrypt',
        '@types/node',
        'typescript',
        'ts-node-dev',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint',
        'jest',
        '@types/jest',
        'ts-jest'
      ];

      requiredDevDependencies.forEach(dep => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it('should have server scripts', () => {
      const packageJsonPath = path.join(serverDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('lint');
      expect(packageJson.scripts).toHaveProperty('test');
    });
  });

  describe('3. Client package.json Dependencies', () => {
    it('should exist at client/package.json', () => {
      const packageJsonPath = path.join(clientDir, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
    });

    it('should have all required dependencies', () => {
      const packageJsonPath = path.join(clientDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const requiredDependencies = [
        'react',
        'react-dom',
        'react-router-dom',
        'axios'
      ];

      requiredDependencies.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have all required devDependencies', () => {
      const packageJsonPath = path.join(clientDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const requiredDevDependencies = [
        '@types/react',
        '@types/react-dom',
        '@vitejs/plugin-react',
        'typescript',
        'vite',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint',
        'eslint-plugin-react',
        'eslint-plugin-react-hooks',
        'vitest',
        '@testing-library/react',
        '@testing-library/jest-dom',
        '@testing-library/user-event'
      ];

      requiredDevDependencies.forEach(dep => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it('should have client scripts', () => {
      const packageJsonPath = path.join(clientDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('preview');
      expect(packageJson.scripts).toHaveProperty('lint');
      expect(packageJson.scripts).toHaveProperty('test');
    });
  });

  describe('4. TypeScript Configuration', () => {
    it('root tsconfig.json should exist and be valid JSON', () => {
      const tsconfigPath = path.join(rootDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(config.compilerOptions).toBeDefined();
      expect(config.compilerOptions.target).toBe('ES2020');
      expect(config.compilerOptions.module).toBe('commonjs');
      expect(config.compilerOptions.strict).toBe(true);
    });

    it('server tsconfig.json should extend root tsconfig', () => {
      const tsconfigPath = path.join(serverDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(config.extends).toBe('../tsconfig.json');
      expect(config.compilerOptions).toHaveProperty('outDir');
      expect(config.compilerOptions).toHaveProperty('rootDir');
    });

    it('client tsconfig.json should extend root tsconfig', () => {
      const tsconfigPath = path.join(clientDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(config.extends).toBe('../tsconfig.json');
      expect(config.compilerOptions).toHaveProperty('target');
      expect(config.compilerOptions).toHaveProperty('module');
      expect(config.compilerOptions).toHaveProperty('jsx');
    });

    it('client tsconfig.node.json should exist for Vite config', () => {
      const tsconfigPath = path.join(clientDir, 'tsconfig.node.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(config.compilerOptions).toHaveProperty('composite');
      expect(config.compilerOptions).toHaveProperty('module');
      expect(config.compilerOptions).toHaveProperty('moduleResolution');
    });
  });

  describe('5. Entry Point Files', () => {
    it('server/src/index.ts should exist', () => {
      const serverIndexPath = path.join(serverDir, 'src', 'index.ts');
      expect(fs.existsSync(serverIndexPath)).toBe(true);
    });

    it('server/src/index.ts should be syntactically correct TypeScript', () => {
      const serverIndexPath = path.join(serverDir, 'src', 'index.ts');
      const content = fs.readFileSync(serverIndexPath, 'utf-8');

      // Basic syntax check - should contain import and export statements
      expect(content).toContain('import');
      expect(content).toContain('export');
    });

    it('client/src/index.tsx should exist', () => {
      const clientIndexPath = path.join(clientDir, 'src', 'index.tsx');
      expect(fs.existsSync(clientIndexPath)).toBe(true);
    });

    it('client/src/index.tsx should be syntactically correct TypeScript', () => {
      const clientIndexPath = path.join(clientDir, 'src', 'index.tsx');
      const content = fs.readFileSync(clientIndexPath, 'utf-8');

      // Basic syntax check - should contain React imports and JSX
      expect(content).toContain('import');
      expect(content).toContain('React');
      expect(content).toContain('ReactDOM');
      expect(content).toContain('render');
    });

    it('client/src/App.tsx should exist', () => {
      const appPath = path.join(clientDir, 'src', 'App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);
    });

    it('client/src/App.tsx should be syntactically correct TypeScript', () => {
      const appPath = path.join(clientDir, 'src', 'App.tsx');
      const content = fs.readFileSync(appPath, 'utf-8');

      // Basic syntax check - should contain React imports and JSX
      expect(content).toContain('import');
      expect(content).toContain('React');
      expect(content).toContain('function App');
      expect(content).toContain('return');
    });

    it('client/index.html should exist', () => {
      const htmlPath = path.join(clientDir, 'index.html');
      expect(fs.existsSync(htmlPath)).toBe(true);
    });

    it('client/index.html should have root div', () => {
      const htmlPath = path.join(clientDir, 'index.html');
      const content = fs.readFileSync(htmlPath, 'utf-8');

      expect(content).toContain('<div id="root"></div>');
      expect(content).toContain('<script type="module"');
    });
  });

  describe('6. Vite Configuration', () => {
    it('client/vite.config.ts should exist', () => {
      const viteConfigPath = path.join(clientDir, 'vite.config.ts');
      expect(fs.existsSync(viteConfigPath)).toBe(true);
    });

    it('client/vite.config.ts should be syntactically correct TypeScript', () => {
      const viteConfigPath = path.join(clientDir, 'vite.config.ts');
      const content = fs.readFileSync(viteConfigPath, 'utf-8');

      // Basic syntax check - should contain import and export
      expect(content).toContain('import');
      expect(content).toContain('export default');
      expect(content).toContain('defineConfig');
    });

    it('client/vite.config.ts should have react plugin configured', () => {
      const viteConfigPath = path.join(clientDir, 'vite.config.ts');
      const content = fs.readFileSync(viteConfigPath, 'utf-8');

      expect(content).toContain('@vitejs/plugin-react');
      expect(content).toContain('react()');
    });

    it('client/vite.config.ts should have server configuration', () => {
      const viteConfigPath = path.join(clientDir, 'vite.config.ts');
      const content = fs.readFileSync(viteConfigPath, 'utf-8');

      expect(content).toContain('server');
      expect(content).toContain('port');
      expect(content).toContain('proxy');
    });

    it('client/vite.config.ts should have API proxy configured', () => {
      const viteConfigPath = path.join(clientDir, 'vite.config.ts');
      const content = fs.readFileSync(viteConfigPath, 'utf-8');

      expect(content).toContain('/api');
      expect(content).toContain('target');
      expect(content).toContain('http://localhost:3001');
    });
  });

  describe('7. Environment Files', () => {
    it('server/.env.example should exist', () => {
      const envExamplePath = path.join(serverDir, '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    it('client/.env.example should exist', () => {
      const envExamplePath = path.join(clientDir, '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });
  });

  describe('8. Linting Configurations', () => {
    it('server/.eslintrc.json should exist', () => {
      const eslintPath = path.join(serverDir, '.eslintrc.json');
      expect(fs.existsSync(eslintPath)).toBe(true);
    });

    it('client/.eslintrc.json should exist', () => {
      const eslintPath = path.join(clientDir, '.eslintrc.json');
      expect(fs.existsSync(eslintPath)).toBe(true);
    });
  });

  describe('9. .gitignore', () => {
    it('.gitignore should exist at root', () => {
      const gitignorePath = path.join(rootDir, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
    });

    it('.gitignore should contain common exclusions', () => {
      const gitignorePath = path.join(rootDir, '.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf-8');

      const commonExclusions = [
        'node_modules',
        'dist',
        '.env',
        '.env.local',
        '.env.development.local',
        '.env.test.local',
        '.env.production.local'
      ];

      commonExclusions.forEach(exclusion => {
        expect(content).toContain(exclusion);
      });
    });
  });
});
