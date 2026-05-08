/**
 * Entry Point File Tests
 *
 * Tests that verify entry point files exist and are valid TypeScript/React code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Entry Point Files', () => {
  const serverIndexPath = path.join(__dirname, '../../server/src/index.ts');
  const clientIndexPath = path.join(__dirname, '../../client/src/index.tsx');
  const clientAppPath = path.join(__dirname, '../../client/src/App.tsx');

  describe('Server Entry Point (index.ts)', () => {
    it('should exist', () => {
      expect(fs.existsSync(serverIndexPath)).toBe(true);
    });

    it('should be a valid TypeScript file', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(() => parse(content, { sourceType: 'module' })).not.toThrow();
    });

    it('should import express', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('import express');
      expect(content).toContain('from \'express\'');
    });

    it('should define an Express app', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('const app = express()');
    });

    it('should define PORT from environment variable', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('const PORT');
      expect(content).toContain('process.env.PORT');
      expect(content).toContain('5000');
    });

    it('should use express.json middleware', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('app.use(express.json())');
    });

    it('should have a health check endpoint', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('/health');
      expect(content).toContain('app.get');
      expect(content).toContain('status: \'ok\'');
    });

    it('should start the server on the specified port', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('app.listen');
      expect(content).toContain('PORT');
    });

    it('should export the app', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('export default app');
    });

    it('should have proper documentation comments', () => {
      const content = fs.readFileSync(serverIndexPath, 'utf-8');
      expect(content).toContain('Server Entry Point');
      expect(content).toContain('This is the main entry point');
    });
  });

  describe('Client Entry Point (index.tsx)', () => {
    it('should exist', () => {
      expect(fs.existsSync(clientIndexPath)).toBe(true);
    });

    it('should be a valid TypeScript/React file', () => {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      expect(() => parse(content, { sourceType: 'module' })).not.toThrow();
    });

    it('should import React', () => {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      expect(content).toContain('import React');
      expect(content).toContain('from \'react\'');
    });

    it('should import ReactDOM', () => {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      expect(content).toContain('import ReactDOM');
      expect(content).toContain('from \'react-dom\'');
    });

    it('should import App component', () => {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      expect(content).toContain('import App');
      expect(content).toContain('from \'./App\'');
    });

    it('should create a root and render App', () => {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      expect(content).toContain('ReactDOM.createRoot');
      expect(content).toContain('document.getElementById');
      expect(content).toContain('.render');
      expect(content).toContain('<App />');
    });

    it('should use React.StrictMode', () => {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      expect(content).toContain('React.StrictMode');
    });

    it('should have proper documentation comments', () => {
      const content = fs.readFileSync(clientIndexPath, 'utf-8');
      expect(content).toContain('Client Entry Point');
      expect(content).toContain('This is the main entry point');
    });
  });

  describe('Client App Component (App.tsx)', () => {
    it('should exist', () => {
      expect(fs.existsSync(clientAppPath)).toBe(true);
    });

    it('should be a valid TypeScript/React file', () => {
      const content = fs.readFileSync(clientAppPath, 'utf-8');
      expect(() => parse(content, { sourceType: 'module' })).not.toThrow();
    });

    it('should import React', () => {
      const content = fs.readFileSync(clientAppPath, 'utf-8');
      expect(content).toContain('import React');
      expect(content).toContain('from \'react\'');
    });

    it('should define an App component', () => {
      const content = fs.readFileSync(clientAppPath, 'utf-8');
      expect(content).toContain('function App');
    });

    it('should export the App component', () => {
      const content = fs.readFileSync(clientAppPath, 'utf-8');
      expect(content).toContain('export default App');
    });

    it('should return JSX', () => {
      const content = fs.readFileSync(clientAppPath, 'utf-8');
      expect(content).toContain('return');
      expect(content).toContain('<div');
      expect(content).toContain('</div>');
    });

    it('should have basic UI elements', () => {
      const content = fs.readFileSync(clientAppPath, 'utf-8');
      expect(content).toContain('h1');
      expect(content).toContain('<h1>Social App</h1>');
      expect(content).toContain('p');
      expect(content).toContain('Application is being set up...');
    });

    it('should have proper documentation comments', () => {
      const content = fs.readFileSync(clientAppPath, 'utf-8');
      expect(content).toContain('Root Component');
      expect(content).toContain('This is the root React component');
    });
  });

  describe('File Structure', () => {
    it('should have server/src directory', () => {
      const serverSrcPath = path.join(__dirname, '../../server/src');
      expect(fs.existsSync(serverSrcPath)).toBe(true);
      expect(fs.statSync(serverSrcPath).isDirectory()).toBe(true);
    });

    it('should have client/src directory', () => {
      const clientSrcPath = path.join(__dirname, '../../client/src');
      expect(fs.existsSync(clientSrcPath)).toBe(true);
      expect(fs.statSync(clientSrcPath).isDirectory()).toBe(true);
    });

    it('should have server/src/index.ts file', () => {
      expect(fs.existsSync(serverIndexPath)).toBe(true);
    });

    it('should have client/src/index.tsx file', () => {
      expect(fs.existsSync(clientIndexPath)).toBe(true);
    });

    it('should have client/src/App.tsx file', () => {
      expect(fs.existsSync(clientAppPath)).toBe(true);
    });

    it('should have proper TypeScript file extensions', () => {
      const serverContent = fs.readFileSync(serverIndexPath, 'utf-8');
      const clientContent = fs.readFileSync(clientIndexPath, 'utf-8');
      const appContent = fs.readFileSync(clientAppPath, 'utf-8');

      expect(serverContent).toContain('.ts');
      expect(clientContent).toContain('.tsx');
      expect(appContent).toContain('.tsx');
    });
  });
});
