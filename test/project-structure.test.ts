/**
 * Project Structure and Configuration Tests
 *
 * These tests verify that:
 * 1. Server entry point can be imported without errors
 * 2. Client entry point can be imported without errors
 * 3. TypeScript configurations are valid JSON
 * 4. Package.json files have required fields (name, version, scripts)
 * 5. Vite config is properly structured
 * 6. Server health check endpoint structure is correct
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path constants
const ROOT_DIR = path.join(__dirname, '..');
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const SERVER_SRC_DIR = path.join(SERVER_DIR, 'src');
const CLIENT_SRC_DIR = path.join(CLIENT_DIR, 'src');
const SERVER_INDEX_PATH = path.join(SERVER_SRC_DIR, 'index.ts');
const CLIENT_INDEX_PATH = path.join(CLIENT_SRC_DIR, 'index.tsx');
const SERVER_TS_CONFIG_PATH = path.join(SERVER_DIR, 'tsconfig.json');
const CLIENT_TS_CONFIG_PATH = path.join(CLIENT_DIR, 'tsconfig.json');
const CLIENT_TS_CONFIG_NODE_PATH = path.join(CLIENT_DIR, 'tsconfig.node.json');
const ROOT_TS_CONFIG_PATH = path.join(ROOT_DIR, 'tsconfig.json');
const SERVER_PACKAGE_PATH = path.join(SERVER_DIR, 'package.json');
const CLIENT_PACKAGE_PATH = path.join(CLIENT_DIR, 'package.json');
const ROOT_PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const VITE_CONFIG_PATH = path.join(CLIENT_DIR, 'vite.config.ts');

describe('Project Structure and Configuration Tests', () => {
  describe('1. Server Entry Point', () => {
    it('should exist at server/src/index.ts', () => {
      expect(fs.existsSync(SERVER_INDEX_PATH)).toBe(true);
    });

    it('should be a valid TypeScript file', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    });

    it('should import required Express dependencies', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/import.*express.*from/);
      expect(content).toMatch(/import.*cors.*from/);
      expect(content).toMatch(/import.*helmet.*from/);
      expect(content).toMatch(/import.*dotenv.*from/);
    });

    it('should define an Express app instance', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/const app = express\(\);/);
    });

    it('should define a PORT constant', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/const PORT/);
    });

    it('should start the server on port', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/app\.listen/);
    });

    it('should export the app instance', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/export default app;/);
    });
  });

  describe('2. Client Entry Point', () => {
    it('should exist at client/src/index.tsx', () => {
      expect(fs.existsSync(CLIENT_INDEX_PATH)).toBe(true);
    });

    it('should be a valid TypeScript/TSX file', () => {
      const content = fs.readFileSync(CLIENT_INDEX_PATH, 'utf-8');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    });

    it('should import React and ReactDOM', () => {
      const content = fs.readFileSync(CLIENT_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/import React from 'react'/);
      expect(content).toMatch(/import ReactDOM from 'react-dom'/);
    });

    it('should import App component', () => {
      const content = fs.readFileSync(CLIENT_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/import App from '\.\/App'/);
    });

    it('should import index.css', () => {
      const content = fs.readFileSync(CLIENT_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/import '\.\/index\.css'/);
    });

    it('should create a root element and render the app', () => {
      const content = fs.readFileSync(CLIENT_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/ReactDOM\.createRoot/);
      expect(content).toMatch(/\.render\(/);
    });

    it('should use React.StrictMode', () => {
      const content = fs.readFileSync(CLIENT_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/React\.StrictMode/);
    });
  });

  describe('3. TypeScript Configurations', () => {
    it('root tsconfig.json should be valid JSON', () => {
      const content = fs.readFileSync(ROOT_TS_CONFIG_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('server tsconfig.json should be valid JSON', () => {
      const content = fs.readFileSync(SERVER_TS_CONFIG_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('client tsconfig.json should be valid JSON', () => {
      const content = fs.readFileSync(CLIENT_TS_CONFIG_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('client tsconfig.node.json should be valid JSON', () => {
      const content = fs.readFileSync(CLIENT_TS_CONFIG_NODE_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('root tsconfig.json should have required compiler options', () => {
      const config = JSON.parse(fs.readFileSync(ROOT_TS_CONFIG_PATH, 'utf-8'));
      expect(config.compilerOptions).toBeDefined();
      expect(config.compilerOptions.target).toBe('ES2020');
      expect(config.compilerOptions.module).toBe('commonjs');
      expect(config.compilerOptions.strict).toBe(true);
    });

    it('server tsconfig.json should have include/exclude patterns', () => {
      const config = JSON.parse(fs.readFileSync(SERVER_TS_CONFIG_PATH, 'utf-8'));
      expect(config.include).toBeDefined();
      expect(config.exclude).toBeDefined();
      expect(config.include).toContain('src/**/*');
      expect(config.exclude).toContain('node_modules');
      expect(config.exclude).toContain('dist');
    });

    it('client tsconfig.json should have React JSX configuration', () => {
      const config = JSON.parse(fs.readFileSync(CLIENT_TS_CONFIG_PATH, 'utf-8'));
      expect(config.compilerOptions).toBeDefined();
      expect(config.compilerOptions.jsx).toBe('react-jsx');
      expect(config.compilerOptions.module).toBe('ESNext');
    });

    it('client tsconfig.node.json should have composite and moduleResolution settings', () => {
      const config = JSON.parse(fs.readFileSync(CLIENT_TS_CONFIG_NODE_PATH, 'utf-8'));
      expect(config.compilerOptions).toBeDefined();
      expect(config.compilerOptions.composite).toBe(true);
      expect(config.compilerOptions.moduleResolution).toBe('bundler');
    });
  });

  describe('4. Package.json Files', () => {
    it('root package.json should be valid JSON', () => {
      const content = fs.readFileSync(ROOT_PACKAGE_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('server package.json should be valid JSON', () => {
      const content = fs.readFileSync(SERVER_PACKAGE_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('client package.json should be valid JSON', () => {
      const content = fs.readFileSync(CLIENT_PACKAGE_PATH, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('root package.json should have required fields', () => {
      const config = JSON.parse(fs.readFileSync(ROOT_PACKAGE_PATH, 'utf-8'));
      expect(config.name).toBeDefined();
      expect(config.version).toBeDefined();
      expect(config.scripts).toBeDefined();
      expect(config.name).toBe('social-app');
      expect(config.version).toBe('1.0.0');
      expect(typeof config.scripts).toBe('object');
    });

    it('root package.json should have workspaces configuration', () => {
      const config = JSON.parse(fs.readFileSync(ROOT_PACKAGE_PATH, 'utf-8'));
      expect(config.workspaces).toBeDefined();
      expect(config.workspaces).toContain('server');
      expect(config.workspaces).toContain('client');
    });

    it('root package.json should have dev script', () => {
      const config = JSON.parse(fs.readFileSync(ROOT_PACKAGE_PATH, 'utf-8'));
      expect(config.scripts.dev).toBeDefined();
      expect(config.scripts.dev).toContain('concurrently');
    });

    it('server package.json should have required fields', () => {
      const config = JSON.parse(fs.readFileSync(SERVER_PACKAGE_PATH, 'utf-8'));
      expect(config.name).toBeDefined();
      expect(config.version).toBeDefined();
      expect(config.scripts).toBeDefined();
      expect(config.main).toBeDefined();
      expect(config.name).toBe('server');
      expect(config.version).toBe('1.0.0');
      expect(config.main).toBe('dist/index.js');
      expect(typeof config.scripts).toBe('object');
    });

    it('server package.json should have dev, build, and start scripts', () => {
      const config = JSON.parse(fs.readFileSync(SERVER_PACKAGE_PATH, 'utf-8'));
      expect(config.scripts.dev).toBeDefined();
      expect(config.scripts.build).toBeDefined();
      expect(config.scripts.start).toBeDefined();
      expect(config.scripts.dev).toContain('ts-node-dev');
      expect(config.scripts.build).toContain('tsc');
      expect(config.scripts.start).toContain('node');
    });

    it('client package.json should have required fields', () => {
      const config = JSON.parse(fs.readFileSync(CLIENT_PACKAGE_PATH, 'utf-8'));
      expect(config.name).toBeDefined();
      expect(config.version).toBeDefined();
      expect(config.scripts).toBeDefined();
      expect(config.name).toBe('client');
      expect(config.version).toBe('1.0.0');
      expect(typeof config.scripts).toBe('object');
    });

    it('client package.json should have dev, build, and test scripts', () => {
      const config = JSON.parse(fs.readFileSync(CLIENT_PACKAGE_PATH, 'utf-8'));
      expect(config.scripts.dev).toBeDefined();
      expect(config.scripts.build).toBeDefined();
      expect(config.scripts.test).toBeDefined();
      expect(config.scripts.dev).toContain('vite');
      expect(config.scripts.build).toContain('tsc');
      expect(config.scripts.test).toContain('vitest');
    });

    it('client package.json should have React dependencies', () => {
      const config = JSON.parse(fs.readFileSync(CLIENT_PACKAGE_PATH, 'utf-8'));
      expect(config.dependencies).toBeDefined();
      expect(config.dependencies.react).toBeDefined();
      expect(config.dependencies['react-dom']).toBeDefined();
      expect(config.dependencies['react-router-dom']).toBeDefined();
    });

    it('server package.json should have Express dependencies', () => {
      const config = JSON.parse(fs.readFileSync(SERVER_PACKAGE_PATH, 'utf-8'));
      expect(config.dependencies).toBeDefined();
      expect(config.dependencies.express).toBeDefined();
      expect(config.dependencies.jsonwebtoken).toBeDefined();
      expect(config.dependencies.bcryptjs).toBeDefined();
    });

    it('client package.json should have vitest and testing dependencies', () => {
      const config = JSON.parse(fs.readFileSync(CLIENT_PACKAGE_PATH, 'utf-8'));
      expect(config.devDependencies).toBeDefined();
      expect(config.devDependencies.vitest).toBeDefined();
      expect(config.devDependencies['@testing-library/react']).toBeDefined();
      expect(config.devDependencies['@testing-library/jest-dom']).toBeDefined();
    });
  });

  describe('5. Vite Configuration', () => {
    it('vite.config.ts should exist', () => {
      expect(fs.existsSync(VITE_CONFIG_PATH)).toBe(true);
    });

    it('vite.config.ts should be valid TypeScript', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    });

    it('vite.config.ts should import defineConfig', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/import.*defineConfig/);
    });

    it('vite.config.ts should import react plugin', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/import react from '@vitejs\/plugin-react'/);
    });

    it('vite.config.ts should export a default config', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/export default defineConfig/);
    });

    it('vite.config.ts should have plugins configured', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/plugins: \[react\(\)\]/);
    });

    it('vite.config.ts should have server configuration', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/server:/);
    });

    it('vite.config.ts should have port configured', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/port: 3000/);
    });

    it('vite.config.ts should have API proxy configuration', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/proxy:/);
      expect(content).toMatch(/\/api/);
      expect(content).toMatch(/target: 'http:\/\/localhost:3001'/);
    });

    it('vite.config.ts should have changeOrigin configured', () => {
      const content = fs.readFileSync(VITE_CONFIG_PATH, 'utf-8');
      expect(content).toMatch(/changeOrigin: true/);
    });
  });

  describe('6. Server Health Check Endpoint', () => {
    it('should define health check endpoint', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/app\.get\('\/health'/);
    });

    it('should return 200 status code', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/res\.status\(200\)/);
    });

    it('should return JSON response', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/res\.json\(/);
    });

    it('should return status field in response', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/status: 'ok'/);
    });

    it('should return message field in response', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/message: 'Server is running'/);
    });

    it('should use GET method for health check', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/app\.get\(/);
    });

    it('should handle req and res parameters', () => {
      const content = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
      expect(content).toMatch(/app\.get\(/).toMatch(/req,/).toMatch(/res,/);
    });
  });

  describe('7. File Structure Validation', () => {
    it('server directory should exist', () => {
      expect(fs.existsSync(SERVER_DIR)).toBe(true);
    });

    it('server/src directory should exist', () => {
      expect(fs.existsSync(SERVER_SRC_DIR)).toBe(true);
    });

    it('client directory should exist', () => {
      expect(fs.existsSync(CLIENT_DIR)).toBe(true);
    });

    it('client/src directory should exist', () => {
      expect(fs.existsSync(CLIENT_SRC_DIR)).toBe(true);
    });

    it('client should have index.html', () => {
      const indexHtmlPath = path.join(CLIENT_DIR, 'index.html');
      expect(fs.existsSync(indexHtmlPath)).toBe(true);
    });

    it('client should have App.tsx', () => {
      const appPath = path.join(CLIENT_SRC_DIR, 'App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);
    });

    it('client should have index.css', () => {
      const cssPath = path.join(CLIENT_SRC_DIR, 'index.css');
      expect(fs.existsSync(cssPath)).toBe(true);
    });

    it('server should have .env.example', () => {
      const envExamplePath = path.join(SERVER_DIR, '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });
  });
});
