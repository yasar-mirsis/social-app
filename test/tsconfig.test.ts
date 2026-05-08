/**
 * TypeScript Configuration Tests
 *
 * Tests that verify tsconfig.json files are valid and have correct compiler options.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('TypeScript Configuration Validation', () => {
  const rootTsConfigPath = path.join(__dirname, '../../tsconfig.json');
  const serverTsConfigPath = path.join(__dirname, '../../server/tsconfig.json');
  const clientTsConfigPath = path.join(__dirname, '../../client/tsconfig.json');
  const clientNodeTsConfigPath = path.join(__dirname, '../../client/tsconfig.node.json');

  describe('Root tsconfig.json', () => {
    it('should exist', () => {
      expect(fs.existsSync(rootTsConfigPath)).toBe(true);
    });

    it('should be a valid JSON file', () => {
      const content = fs.readFileSync(rootTsConfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have required compiler options', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      const options = config.compilerOptions;

      expect(options).toHaveProperty('target');
      expect(options).toHaveProperty('module');
      expect(options).toHaveProperty('lib');
      expect(options).toHaveProperty('moduleResolution');
      expect(options).toHaveProperty('esModuleInterop');
      expect(options).toHaveProperty('allowSyntheticDefaultImports');
      expect(options).toHaveProperty('strict');
      expect(options).toHaveProperty('skipLibCheck');
      expect(options).toHaveProperty('forceConsistentCasingInFileNames');
      expect(options).toHaveProperty('resolveJsonModule');
      expect(options).toHaveProperty('declaration');
      expect(options).toHaveProperty('declarationMap');
      expect(options).toHaveProperty('sourceMap');
      expect(options).toHaveProperty('outDir');
    });

    it('should have correct target', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.target).toBe('ES2020');
    });

    it('should have correct module', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.module).toBe('commonjs');
    });

    it('should have correct lib', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.lib).toContain('ES2020');
    });

    it('should have correct moduleResolution', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.moduleResolution).toBe('node');
    });

    it('should have strict mode enabled', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.strict).toBe(true);
    });

    it('should have esModuleInterop enabled', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.esModuleInterop).toBe(true);
    });

    it('should have source maps enabled', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.sourceMap).toBe(true);
    });

    it('should have declaration files enabled', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.declaration).toBe(true);
    });

    it('should have declaration maps enabled', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.declarationMap).toBe(true);
    });

    it('should have correct outDir', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.outDir).toBe('./dist');
    });

    it('should have correct exclude patterns', () => {
      const config = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf-8'));
      const exclude = config.exclude;

      expect(exclude).toContain('node_modules');
      expect(exclude).toContain('dist');
      expect(exclude).toContain('build');
    });
  });

  describe('Server tsconfig.json', () => {
    it('should exist', () => {
      expect(fs.existsSync(serverTsConfigPath)).toBe(true);
    });

    it('should be a valid JSON file', () => {
      const content = fs.readFileSync(serverTsConfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should extend root tsconfig', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      expect(config.extends).toBe('../tsconfig.json');
    });

    it('should have required compiler options', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      const options = config.compilerOptions;

      expect(options).toHaveProperty('outDir');
      expect(options).toHaveProperty('rootDir');
      expect(options).toHaveProperty('target');
      expect(options).toHaveProperty('module');
      expect(options).toHaveProperty('lib');
      expect(options).toHaveProperty('types');
    });

    it('should have correct outDir', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.outDir).toBe('./dist');
    });

    it('should have correct rootDir', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.rootDir).toBe('./src');
    });

    it('should have correct module', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.module).toBe('commonjs');
    });

    it('should have correct lib', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.lib).toContain('ES2020');
    });

    it('should have types specified', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.types).toContain('node');
    });

    it('should have correct include patterns', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      const include = config.include;

      expect(include).toContain('src/**/*');
    });

    it('should have correct exclude patterns', () => {
      const config = JSON.parse(fs.readFileSync(serverTsConfigPath, 'utf-8'));
      const exclude = config.exclude;

      expect(exclude).toContain('node_modules');
      expect(exclude).toContain('dist');
      expect(exclude).toContain('**/*.test.ts');
    });
  });

  describe('Client tsconfig.json', () => {
    it('should exist', () => {
      expect(fs.existsSync(clientTsConfigPath)).toBe(true);
    });

    it('should be a valid JSON file', () => {
      const content = fs.readFileSync(clientTsConfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should extend root tsconfig', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.extends).toBe('../tsconfig.json');
    });

    it('should have required compiler options', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      const options = config.compilerOptions;

      expect(options).toHaveProperty('target');
      expect(options).toHaveProperty('module');
      expect(options).toHaveProperty('lib');
      expect(options).toHaveProperty('jsx');
      expect(options).toHaveProperty('moduleResolution');
      expect(options).toHaveProperty('allowImportingTsExtensions');
      expect(options).toHaveProperty('resolveJsonModule');
      expect(options).toHaveProperty('isolatedModules');
      expect(options).toHaveProperty('noEmit');
      expect(options).toHaveProperty('types');
    });

    it('should have correct target', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.target).toBe('ES2020');
    });

    it('should have correct module', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.module).toBe('ESNext');
    });

    it('should have correct lib', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      const lib = config.compilerOptions.lib;

      expect(lib).toContain('ES2020');
      expect(lib).toContain('DOM');
      expect(lib).toContain('DOM.Iterable');
    });

    it('should have correct jsx', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.jsx).toBe('react-jsx');
    });

    it('should have correct moduleResolution', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.moduleResolution).toBe('bundler');
    });

    it('should have allowImportingTsExtensions enabled', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.allowImportingTsExtensions).toBe(true);
    });

    it('should have isolatedModules enabled', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.isolatedModules).toBe(true);
    });

    it('should have noEmit enabled', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.noEmit).toBe(true);
    });

    it('should have types specified', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.types).toContain('vite/client');
    });

    it('should have correct include patterns', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      const include = config.include;

      expect(include).toContain('src');
    });

    it('should have TypeScript project references', () => {
      const config = JSON.parse(fs.readFileSync(clientTsConfigPath, 'utf-8'));
      expect(config.references).toBeInstanceOf(Array);
      expect(config.references).toHaveLength(1);
      expect(config.references[0]).toHaveProperty('path');
      expect(config.references[0].path).toBe('./tsconfig.node.json');
    });
  });

  describe('Client tsconfig.node.json', () => {
    it('should exist', () => {
      expect(fs.existsSync(clientNodeTsConfigPath)).toBe(true);
    });

    it('should be a valid JSON file', () => {
      const content = fs.readFileSync(clientNodeTsConfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have required compiler options', () => {
      const config = JSON.parse(fs.readFileSync(clientNodeTsConfigPath, 'utf-8'));
      const options = config.compilerOptions;

      expect(options).toHaveProperty('composite');
      expect(options).toHaveProperty('skipLibCheck');
      expect(options).haveProperty('module');
      expect(options).toHaveProperty('moduleResolution');
      expect(options).toHaveProperty('allowSyntheticDefaultImports');
    });

    it('should have composite mode enabled', () => {
      const config = JSON.parse(fs.readFileSync(clientNodeTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.composite).toBe(true);
    });

    it('should have skipLibCheck enabled', () => {
      const config = JSON.parse(fs.readFileSync(clientNodeTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.skipLibCheck).toBe(true);
    });

    it('should have correct module', () => {
      const config = JSON.parse(fs.readFileSync(clientNodeTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.module).toBe('ESNext');
    });

    it('should have correct moduleResolution', () => {
      const config = JSON.parse(fs.readFileSync(clientNodeTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.moduleResolution).toBe('bundler');
    });

    it('should have allowSyntheticDefaultImports enabled', () => {
      const config = JSON.parse(fs.readFileSync(clientNodeTsConfigPath, 'utf-8'));
      expect(config.compilerOptions.allowSyntheticDefaultImports).toBe(true);
    });

    it('should have correct include patterns', () => {
      const config = JSON.parse(fs.readFileSync(clientNodeTsConfigPath, 'utf-8'));
      const include = config.include;

      expect(include).toContain('vite.config.ts');
    });
  });
});
