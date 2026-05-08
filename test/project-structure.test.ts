/**
 * Project Structure Tests
 * Tests for verifying the initial project setup
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import assert from 'assert';

const projectRoot = path.resolve(__dirname, '../..');
const serverDir = path.join(projectRoot, 'server');
const clientDir = path.join(projectRoot, 'client');

describe('Project Structure Tests', () => {
  describe('TypeScript Configuration Files', () => {
    it('should have valid root tsconfig.json', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      assert(fs.existsSync(tsconfigPath), 'Root tsconfig.json should exist');

      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.files, [], 'Root tsconfig should have empty files array');
      assert(Array.isArray(config.references), 'Root tsconfig should have references array');
      assert.strictEqual(config.references.length, 2, 'Root tsconfig should have 2 workspace references');
    });

    it('should have valid server tsconfig.json', () => {
      const tsconfigPath = path.join(serverDir, 'tsconfig.json');
      assert(fs.existsSync(tsconfigPath), 'Server tsconfig.json should exist');

      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.extends, '../tsconfig.json', 'Server tsconfig should extend root config');
      assert.strictEqual(config.compilerOptions.target, 'ES2022', 'Server should target ES2022');
      assert.strictEqual(config.compilerOptions.module, 'commonjs', 'Server should use commonjs module');
      assert.strictEqual(config.compilerOptions.outDir, './dist', 'Server should output to dist');
      assert.strictEqual(config.compilerOptions.rootDir, './src', 'Server should use src as root');
      assert.strictEqual(config.compilerOptions.strict, true, 'Server should have strict mode enabled');
      assert(Array.isArray(config.include), 'Server tsconfig should have include array');
    });

    it('should have valid client tsconfig.json', () => {
      const tsconfigPath = path.join(clientDir, 'tsconfig.json');
      assert(fs.existsSync(tsconfigPath), 'Client tsconfig.json should exist');

      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.extends, '../tsconfig.json', 'Client tsconfig should extend root config');
      assert.strictEqual(config.compilerOptions.target, 'ES2020', 'Client should target ES2020');
      assert.strictEqual(config.compilerOptions.module, 'ESNext', 'Client should use ESNext module');
      assert.strictEqual(config.compilerOptions.jsx, 'react-jsx', 'Client should use react-jsx JSX transformation');
      assert.strictEqual(config.compilerOptions.strict, true, 'Client should have strict mode enabled');
      assert(Array.isArray(config.include), 'Client tsconfig should have include array');
      assert(Array.isArray(config.references), 'Client tsconfig should have references array');
    });

    it('should have valid client tsconfig.node.json', () => {
      const tsconfigPath = path.join(clientDir, 'tsconfig.node.json');
      assert(fs.existsSync(tsconfigPath), 'Client tsconfig.node.json should exist');

      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.extends, '../../tsconfig.json', 'Client tsconfig.node should extend root config');
      assert.strictEqual(config.compilerOptions.target, 'ES2020', 'Client tsconfig.node should target ES2020');
      assert.strictEqual(config.compilerOptions.module, 'ESNext', 'Client tsconfig.node should use ESNext module');
      assert.strictEqual(config.compilerOptions.moduleResolution, 'bundler', 'Client tsconfig.node should use bundler resolution');
      assert.strictEqual(config.compilerOptions.noEmit, true, 'Client tsconfig.node should not emit files');
    });

    it('should be able to parse all TypeScript configs', () => {
      const tsconfigFiles = [
        path.join(projectRoot, 'tsconfig.json'),
        path.join(serverDir, 'tsconfig.json'),
        path.join(clientDir, 'tsconfig.json'),
        path.join(clientDir, 'tsconfig.node.json'),
      ];

      tsconfigFiles.forEach((tsconfigPath) => {
        const content = fs.readFileSync(tsconfigPath, 'utf-8');
        assert.doesNotThrow(() => JSON.parse(content), `Should parse ${path.basename(tsconfigPath)}`);
      });
    });
  });

  describe('Package.json Files', () => {
    it('should have valid root package.json', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      assert(fs.existsSync(packageJsonPath), 'Root package.json should exist');

      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.name, 'social-app', 'Root package.json should have name "social-app"');
      assert.strictEqual(config.private, true, 'Root package.json should be private');
      assert(Array.isArray(config.workspaces), 'Root package.json should have workspaces array');
      assert.strictEqual(config.workspaces.length, 2, 'Root package.json should have 2 workspaces');
      assert(Array.isArray(config.scripts), 'Root package.json should have scripts array');
      assert(config.scripts.dev, 'Root package.json should have dev script');
      assert(config.scripts.build, 'Root package.json should have build script');
      assert(config.scripts.start, 'Root package.json should have start script');
    });

    it('should have valid server package.json', () => {
      const packageJsonPath = path.join(serverDir, 'package.json');
      assert(fs.existsSync(packageJsonPath), 'Server package.json should exist');

      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.name, 'social-app-server', 'Server package.json should have name "social-app-server"');
      assert.strictEqual(config.main, 'dist/index.js', 'Server package.json should have main entry');
      assert(Array.isArray(config.scripts), 'Server package.json should have scripts array');
      assert(config.scripts.dev, 'Server package.json should have dev script');
      assert(config.scripts.build, 'Server package.json should have build script');
      assert(config.scripts.start, 'Server package.json should have start script');
      assert(config.scripts.test, 'Server package.json should have test script');
      assert(Array.isArray(config.dependencies), 'Server package.json should have dependencies');
      assert(Array.isArray(config.devDependencies), 'Server package.json should have devDependencies');
    });

    it('should have valid client package.json', () => {
      const packageJsonPath = path.join(clientDir, 'package.json');
      assert(fs.existsSync(packageJsonPath), 'Client package.json should exist');

      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.name, 'social-app-client', 'Client package.json should have name "social-app-client"');
      assert.strictEqual(config.private, true, 'Client package.json should be private');
      assert(Array.isArray(config.scripts), 'Client package.json should have scripts array');
      assert(config.scripts.dev, 'Client package.json should have dev script');
      assert(config.scripts.build, 'Client package.json should have build script');
      assert(config.scripts.preview, 'Client package.json should have preview script');
      assert(config.scripts.test, 'Client package.json should have test script');
      assert(Array.isArray(config.dependencies), 'Client package.json should have dependencies');
      assert(Array.isArray(config.devDependencies), 'Client package.json should have devDependencies');
    });

    it('should have valid ESLint configuration', () => {
      const eslintPath = path.join(projectRoot, '.eslintrc.json');
      assert(fs.existsSync(eslintPath), 'Root .eslintrc.json should exist');

      const content = fs.readFileSync(eslintPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.root, true, 'ESLint config should have root: true');
      assert.strictEqual(config.parser, '@typescript-eslint/parser', 'ESLint should use TypeScript parser');
      assert(Array.isArray(config.extends), 'ESLint config should have extends array');
    });

    it('should have valid client ESLint configuration', () => {
      const eslintPath = path.join(clientDir, '.eslintrc.json');
      assert(fs.existsSync(eslintPath), 'Client .eslintrc.json should exist');

      const content = fs.readFileSync(eslintPath, 'utf-8');
      const config = JSON.parse(content);

      assert.strictEqual(config.root, true, 'Client ESLint config should have root: true');
      assert.strictEqual(config.parser, '@typescript-eslint/parser', 'Client ESLint should use TypeScript parser');
    });

    it('should have valid .env.example file', () => {
      const envExamplePath = path.join(projectRoot, '.env.example');
      assert(fs.existsSync(envExamplePath), '.env.example should exist');

      const content = fs.readFileSync(envExamplePath, 'utf-8');
      assert(content.includes('PORT='), '.env.example should have PORT variable');
    });

    it('should be able to parse all package.json files', () => {
      const packageJsonFiles = [
        path.join(projectRoot, 'package.json'),
        path.join(serverDir, 'package.json'),
        path.join(clientDir, 'package.json'),
      ];

      packageJsonFiles.forEach((packageJsonPath) => {
        const content = fs.readFileSync(packageJsonPath, 'utf-8');
        assert.doesNotThrow(() => JSON.parse(content), `Should parse ${path.basename(packageJsonPath)}`);
      });
    });
  });

  describe('Entry Point Files', () => {
    it('should have server entry point file', () => {
      const entryPath = path.join(serverDir, 'src', 'index.ts');
      assert(fs.existsSync(entryPath), 'Server entry point should exist');

      const content = fs.readFileSync(entryPath, 'utf-8');
      assert(content.includes('express'), 'Server entry should import express');
      assert(content.includes('app.listen'), 'Server entry should start server');
    });

    it('should have client entry point file', () => {
      const entryPath = path.join(clientDir, 'src', 'index.tsx');
      assert(fs.existsSync(entryPath), 'Client entry point should exist');

      const content = fs.readFileSync(entryPath, 'utf-8');
      assert(content.includes('ReactDOM'), 'Client entry should use ReactDOM');
      assert(content.includes('createRoot'), 'Client entry should create root');
    });

    it('should have client App component file', () => {
      const appPath = path.join(clientDir, 'src', 'App.tsx');
      assert(fs.existsSync(appPath), 'Client App component should exist');

      const content = fs.readFileSync(appPath, 'utf-8');
      assert(content.includes('function App'), 'App component should be defined');
      assert(content.includes('export default App'), 'App component should be exported');
    });

    it('should have client HTML template', () => {
      const htmlPath = path.join(clientDir, 'index.html');
      assert(fs.existsSync(htmlPath), 'Client HTML template should exist');

      const content = fs.readFileSync(htmlPath, 'utf-8');
      assert(content.includes('id="root"'), 'HTML should have root element');
      assert(content.includes('<script type="module"'), 'HTML should have module script');
    });

    it('should have client Vite configuration', () => {
      const viteConfigPath = path.join(clientDir, 'vite.config.ts');
      assert(fs.existsSync(viteConfigPath), 'Client Vite config should exist');

      const content = fs.readFileSync(viteConfigPath, 'utf-8');
      assert(content.includes('defineConfig'), 'Vite config should use defineConfig');
      assert(content.includes('react'), 'Vite config should include React plugin');
      assert(content.includes('proxy'), 'Vite config should have proxy configuration');
    });

    it('should have valid syntax in entry point files', () => {
      const entryFiles = [
        path.join(serverDir, 'src', 'index.ts'),
        path.join(clientDir, 'src', 'index.tsx'),
        path.join(clientDir, 'src', 'App.tsx'),
      ];

      entryFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        assert.doesNotThrow(() => eval(content), `Should have valid syntax in ${filePath}`);
      });
    });
  });

  describe('Workspace Structure', () => {
    it('should have server directory', () => {
      assert(fs.existsSync(serverDir), 'Server directory should exist');
      assert(fs.statSync(serverDir).isDirectory(), 'Server path should be a directory');
    });

    it('should have client directory', () => {
      assert(fs.existsSync(clientDir), 'Client directory should exist');
      assert(fs.statSync(clientDir).isDirectory(), 'Client path should be a directory');
    });

    it('should have server src directory', () => {
      const serverSrcDir = path.join(serverDir, 'src');
      assert(fs.existsSync(serverSrcDir), 'Server src directory should exist');
      assert(fs.statSync(serverSrcDir).isDirectory(), 'Server src path should be a directory');
    });

    it('should have client src directory', () => {
      const clientSrcDir = path.join(clientDir, 'src');
      assert(fs.existsSync(clientSrcDir), 'Client src directory should exist');
      assert(fs.statSync(clientSrcDir).isDirectory(), 'Client src path should be a directory');
    });

    it('should have server dist directory (empty)', () => {
      const serverDistDir = path.join(serverDir, 'dist');
      assert(fs.existsSync(serverDistDir), 'Server dist directory should exist');
      assert(fs.statSync(serverDistDir).isDirectory(), 'Server dist path should be a directory');
    });
  });
});
