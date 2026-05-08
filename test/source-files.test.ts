/**
 * Test suite for source files
 * Validates source files are syntactically correct TypeScript/TSX
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '..');

describe('Source Files', () => {
  describe('Server Source Files', () => {
    test('server/src/index.ts exists', () => {
      const indexPath = path.join(ROOT_DIR, 'server/src/index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    test('server/src/index.ts is valid TypeScript', () => {
      const indexPath = path.join(ROOT_DIR, 'server/src/index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      // Check for TypeScript-specific syntax
      expect(content).toContain('import');
      expect(content).toContain('const');
      expect(content).toContain('function');
      expect(content).toContain('export');
    });

    test('server/src/index.ts has required imports', () => {
      const indexPath = path.join(ROOT_DIR, 'server/src/index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('import express from \'express\'');
      expect(content).toContain('import cors from \'cors\'');
      expect(content).toContain('import dotenv from \'dotenv\'');
    });

    test('server/src/index.ts has Express server setup', () => {
      const indexPath = path.join(ROOT_DIR, 'server/src/index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('const app = express()');
      expect(content).toContain('app.use(cors())');
      expect(content).toContain('app.use(express.json())');
    });

    test('server/src/index.ts has health check endpoint', () => {
      const indexPath = path.join(ROOT_DIR, 'server/src/index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('/health');
      expect(content).toContain('app.get');
    });

    test('server/src/index.ts starts server on port', () => {
      const indexPath = path.join(ROOT_DIR, 'server/src/index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('app.listen');
      expect(content).toContain('PORT');
    });
  });

  describe('Client Source Files', () => {
    test('client/src/index.tsx exists', () => {
      const indexPath = path.join(ROOT_DIR, 'client/src/index.tsx');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    test('client/src/index.tsx is valid TypeScript/TSX', () => {
      const indexPath = path.join(ROOT_DIR, 'client/src/index.tsx');
      const content = fs.readFileSync(indexPath, 'utf-8');

      // Check for React/TSX-specific syntax
      expect(content).toContain('import');
      expect(content).toContain('export default');
      expect(content).toContain('React.StrictMode');
      expect(content).toContain('ReactDOM.createRoot');
    });

    test('client/src/index.tsx has required imports', () => {
      const indexPath = path.join(ROOT_DIR, 'client/src/index.tsx');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('import React from \'react\'');
      expect(content).toContain('import ReactDOM from \'react-dom/client\'');
      expect(content).toContain('import App from \'./App\'');
      expect(content).toContain('import \'./index.css\'');
    });

    test('client/src/index.tsx renders App component', () => {
      const indexPath = path.join(ROOT_DIR, 'client/src/index.tsx');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('ReactDOM.createRoot');
      expect(content).toContain('.render');
      expect(content).toContain('<React.StrictMode>');
      expect(content).toContain('<App />');
    });

    test('client/src/App.tsx exists', () => {
      const appPath = path.join(ROOT_DIR, 'client/src/App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);
    });

    test('client/src/App.tsx is valid TypeScript/TSX', () => {
      const appPath = path.join(ROOT_DIR, 'client/src/App.tsx');
      const content = fs.readFileSync(appPath, 'utf-8');

      // Check for React/TSX-specific syntax
      expect(content).toContain('import');
      expect(content).toContain('export default function');
      expect(content).toContain('return');
      expect(content).toContain('<div');
      expect(content).toContain('<h1');
    });

    test('client/src/App.tsx has App component', () => {
      const appPath = path.join(ROOT_DIR, 'client/src/App.tsx');
      const content = fs.readFileSync(appPath, 'utf-8');

      expect(content).toContain('export default function App()');
      expect(content).toContain('return (');
      expect(content).toContain('<div className="App">');
    });

    test('client/src/App.tsx has header and main content', () => {
      const appPath = path.join(ROOT_DIR, 'client/src/App.tsx');
      const content = fs.readFileSync(appPath, 'utf-8');

      expect(content).toContain('<header>');
      expect(content).toContain('<h1>Social App</h1>');
      expect(content).toContain('<main>');
      expect(content).toContain('Application is under development');
    });

    test('client/src/index.css exists', () => {
      const cssPath = path.join(ROOT_DIR, 'client/src/index.css');
      expect(fs.existsSync(cssPath)).toBe(true);
    });

    test('client/src/test/setup.ts exists', () => {
      const setupPath = path.join(ROOT_DIR, 'client/src/test/setup.ts');
      expect(fs.existsSync(setupPath)).toBe(true);
    });

    test('client/src/test/setup.ts is valid TypeScript', () => {
      const setupPath = path.join(ROOT_DIR, 'client/src/test/setup.ts');
      const content = fs.readFileSync(setupPath, 'utf-8');

      expect(content).toContain('import');
      expect(content).toContain('@testing-library/jest-dom');
    });
  });

  describe('Source File Structure', () => {
    test('server/src directory contains index.ts', () => {
      const srcDir = path.join(ROOT_DIR, 'server/src');
      expect(fs.existsSync(srcDir)).toBe(true);

      const files = fs.readdirSync(srcDir);
      expect(files).toContain('index.ts');
    });

    test('client/src directory contains all required files', () => {
      const srcDir = path.join(ROOT_DIR, 'client/src');
      expect(fs.existsSync(srcDir)).toBe(true);

      const files = fs.readdirSync(srcDir);
      expect(files).toContain('index.tsx');
      expect(files).toContain('App.tsx');
      expect(files).toContain('index.css');
    });

    test('client/src/test directory exists', () => {
      const testDir = path.join(ROOT_DIR, 'client/src/test');
      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.statSync(testDir).isDirectory()).toBe(true);

      const files = fs.readdirSync(testDir);
      expect(files).toContain('setup.ts');
    });
  });

  describe('Source File Syntax Validation', () => {
    test('server/src/index.ts has no syntax errors', () => {
      const indexPath = path.join(ROOT_DIR, 'server/src/index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      // Check for common syntax patterns
      expect(content).toMatch(/import\s+.*\s+from\s+['"]/);
      expect(content).toMatch(/const\s+\w+\s*=/);
      expect(content).toMatch(/function\s+\w+\s*\(/);
      expect(content).toMatch(/export\s+/);
    });

    test('client/src/index.tsx has JSX syntax', () => {
      const indexPath = path.join(ROOT_DIR, 'client/src/index.tsx');
      const content = fs.readFileSync(indexPath, 'utf-8');

      // Check for JSX patterns
      expect(content).toMatch(/<\w+/);
      expect(content).toMatch(/<\/\w+>/);
      expect(content).toMatch(/className=/);
    });

    test('client/src/App.tsx has JSX syntax', () => {
      const appPath = path.join(ROOT_DIR, 'client/src/App.tsx');
      const content = fs.readFileSync(appPath, 'utf-8');

      // Check for JSX patterns
      expect(content).toMatch(/<\w+/);
      expect(content).toMatch(/<\/\w+>/);
      expect(content).toMatch(/className=/);
    });
  });
});
