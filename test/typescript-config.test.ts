/**
 * Test suite for TypeScript configurations
 * Validates TypeScript configs are valid and properly extend each other
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '..');

describe('TypeScript Configurations', () => {
  describe('Root tsconfig.json', () => {
    let rootConfig: any;

    beforeAll(() => {
      const configPath = path.join(ROOT_DIR, 'tsconfig.json');
      rootConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    });

    test('has required compiler options', () => {
      expect(rootConfig.compilerOptions).toHaveProperty('target');
      expect(rootConfig.compilerOptions).toHaveProperty('module');
      expect(rootConfig.compilerOptions).toHaveProperty('lib');
      expect(rootConfig.compilerOptions).toHaveProperty('strict');
      expect(rootConfig.compilerOptions).toHaveProperty('esModuleInterop');
      expect(rootConfig.compilerOptions).toHaveProperty('skipLibCheck');
      expect(rootConfig.compilerOptions).toHaveProperty('forceConsistentCasingInFileNames');
      expect(rootConfig.compilerOptions).toHaveProperty('resolveJsonModule');
      expect(rootConfig.compilerOptions).toHaveProperty('moduleResolution');
      expect(rootConfig.compilerOptions).toHaveProperty('declaration');
      expect(rootConfig.compilerOptions).toHaveProperty('declarationMap');
      expect(rootConfig.compilerOptions).toHaveProperty('sourceMap');
      expect(rootConfig.compilerOptions).toHaveProperty('outDir');
      expect(rootConfig.compilerOptions).toHaveProperty('rootDir');
      expect(rootConfig.compilerOptions).toHaveProperty('composite');
    });

    test('target is ES2022', () => {
      expect(rootConfig.compilerOptions.target).toBe('ES2022');
    });

    test('module is commonjs', () => {
      expect(rootConfig.compilerOptions.module).toBe('commonjs');
    });

    test('lib includes ES2022', () => {
      expect(rootConfig.compilerOptions.lib).toContain('ES2022');
    });

    test('strict mode is enabled', () => {
      expect(rootConfig.compilerOptions.strict).toBe(true);
    });

    test('composite is enabled for project references', () => {
      expect(rootConfig.compilerOptions.composite).toBe(true);
    });

    test('outDir is ./dist', () => {
      expect(rootConfig.compilerOptions.outDir).toBe('./dist');
    });

    test('rootDir is ./', () => {
      expect(rootConfig.compilerOptions.rootDir).toBe('./');
    });

    test('declaration is true', () => {
      expect(rootConfig.compilerOptions.declaration).toBe(true);
    });

    test('has exclude array', () => {
      expect(rootConfig.exclude).toBeInstanceOf(Array);
    });

    test('excludes node_modules, dist, build, coverage', () => {
      expect(rootConfig.exclude).toContain('node_modules');
      expect(rootConfig.exclude).toContain('dist');
      expect(rootConfig.exclude).toContain('build');
      expect(rootConfig.exclude).toContain('coverage');
    });
  });

  describe('Server tsconfig.json', () => {
    let serverConfig: any;

    beforeAll(() => {
      const configPath = path.join(ROOT_DIR, 'server/tsconfig.json');
      serverConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    });

    test('extends root tsconfig.json', () => {
      expect(serverConfig.extends).toBe('../tsconfig.json');
    });

    test('has required compiler options', () => {
      expect(serverConfig.compilerOptions).toHaveProperty('target');
      expect(serverConfig.compilerOptions).toHaveProperty('module');
      expect(serverConfig.compilerOptions).toHaveProperty('lib');
      expect(serverConfig.compilerOptions).toHaveProperty('outDir');
      expect(serverConfig.compilerOptions).toHaveProperty('rootDir');
      expect(serverConfig.compilerOptions).toHaveProperty('resolveJsonModule');
      expect(serverConfig.compilerOptions).toHaveProperty('moduleResolution');
      expect(serverConfig.compilerOptions).toHaveProperty('esModuleInterop');
      expect(serverConfig.compilerOptions).toHaveProperty('skipLibCheck');
      expect(serverConfig.compilerOptions).toHaveProperty('forceConsistentCasingInFileNames');
      expect(serverConfig.compilerOptions).toHaveProperty('strict');
      expect(serverConfig.compilerOptions).toHaveProperty('declaration');
      expect(serverConfig.compilerOptions).toHaveProperty('declarationMap');
      expect(serverConfig.compilerOptions).toHaveProperty('sourceMap');
      expect(serverConfig.compilerOptions).toHaveProperty('types');
    });

    test('target is ES2022', () => {
      expect(serverConfig.compilerOptions.target).toBe('ES2022');
    });

    test('module is commonjs', () => {
      expect(serverConfig.compilerOptions.module).toBe('commonjs');
    });

    test('lib includes ES2022', () => {
      expect(serverConfig.compilerOptions.lib).toContain('ES2022');
    });

    test('outDir is ./dist', () => {
      expect(serverConfig.compilerOptions.outDir).toBe('./dist');
    });

    test('rootDir is ./src', () => {
      expect(serverConfig.compilerOptions.rootDir).toBe('./src');
    });

    test('includes array has src/**/*', () => {
      expect(serverConfig.include).toContain('src/**/*');
    });

    test('excludes test files', () => {
      expect(serverConfig.exclude).toContain('node_modules');
      expect(serverConfig.exclude).toContain('dist');
      expect(serverConfig.exclude).toContain('**/*.test.ts');
      expect(serverConfig.exclude).toContain('**/*.spec.ts');
    });

    test('includes jest types', () => {
      expect(serverConfig.compilerOptions.types).toContain('jest');
    });
  });

  describe('Client tsconfig.json', () => {
    let clientConfig: any;

    beforeAll(() => {
      const configPath = path.join(ROOT_DIR, 'client/tsconfig.json');
      clientConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    });

    test('extends root tsconfig.json', () => {
      expect(clientConfig.extends).toBe('../tsconfig.json');
    });

    test('has required compiler options', () => {
      expect(clientConfig.compilerOptions).toHaveProperty('target');
      expect(clientConfig.compilerOptions).toHaveProperty('module');
      expect(clientConfig.compilerOptions).toHaveProperty('lib');
      expect(clientConfig.compilerOptions).toHaveProperty('moduleResolution');
      expect(clientConfig.compilerOptions).toHaveProperty('resolveJsonModule');
      expect(clientConfig.compilerOptions).toHaveProperty('allowJs');
      expect(clientConfig.compilerOptions).toHaveProperty('jsx');
      expect(clientConfig.compilerOptions).toHaveProperty('noEmit');
      expect(clientConfig.compilerOptions).toHaveProperty('isolatedModules');
      expect(clientConfig.compilerOptions).toHaveProperty('allowImportingTsExtensions');
      expect(clientConfig.compilerOptions).toHaveProperty('esModuleInterop');
      expect(clientConfig.compilerOptions).toHaveProperty('skipLibCheck');
      expect(clientConfig.compilerOptions).toHaveProperty('forceConsistentCasingInFileNames');
      expect(clientConfig.compilerOptions).toHaveProperty('strict');
    });

    test('target is ES2020', () => {
      expect(clientConfig.compilerOptions.target).toBe('ES2020');
    });

    test('module is ESNext', () => {
      expect(clientConfig.compilerOptions.module).toBe('ESNext');
    });

    test('lib includes ES2020, DOM, DOM.Iterable', () => {
      expect(clientConfig.compilerOptions.lib).toContain('ES2020');
      expect(clientConfig.compilerOptions.lib).toContain('DOM');
      expect(clientConfig.compilerOptions.lib).toContain('DOM.Iterable');
    });

    test('moduleResolution is bundler', () => {
      expect(clientConfig.compilerOptions.moduleResolution).toBe('bundler');
    });

    test('jsx is react-jsx', () => {
      expect(clientConfig.compilerOptions.jsx).toBe('react-jsx');
    });

    test('noEmit is true', () => {
      expect(clientConfig.compilerOptions.noEmit).toBe(true);
    });

    test('isolatedModules is true', () => {
      expect(clientConfig.compilerOptions.isolatedModules).toBe(true);
    });

    test('has strict mode enabled', () => {
      expect(clientConfig.compilerOptions.strict).toBe(true);
    });

    test('has include array with src', () => {
      expect(clientConfig.include).toBe('src');
    });

    test('has project references', () => {
      expect(clientConfig.references).toBeInstanceOf(Array);
      expect(clientConfig.references).toHaveLength(1);
      expect(clientConfig.references[0]).toHaveProperty('path');
      expect(clientConfig.references[0].path).toBe('./tsconfig.node.json');
    });
  });

  describe('Client tsconfig.node.json', () => {
    let nodeConfig: any;

    beforeAll(() => {
      const configPath = path.join(ROOT_DIR, 'client/tsconfig.node.json');
      nodeConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    });

    test('has required compiler options', () => {
      expect(nodeConfig.compilerOptions).toHaveProperty('composite');
      expect(nodeConfig.compilerOptions).toHaveProperty('skipLibCheck');
      expect(nodeConfig.compilerOptions).toHaveProperty('module');
      expect(nodeConfig.compilerOptions).toHaveProperty('moduleResolution');
      expect(nodeConfig.compilerOptions).toHaveProperty('allowSyntheticDefaultImports');
    });

    test('composite is true', () => {
      expect(nodeConfig.compilerOptions.composite).toBe(true);
    });

    test('skipLibCheck is true', () => {
      expect(nodeConfig.compilerOptions.skipLibCheck).toBe(true);
    });

    test('module is ESNext', () => {
      expect(nodeConfig.compilerOptions.module).toBe('ESNext');
    });

    test('moduleResolution is bundler', () => {
      expect(nodeConfig.compilerOptions.moduleResolution).toBe('bundler');
    });

    test('allowSyntheticDefaultImports is true', () => {
      expect(nodeConfig.compilerOptions.allowSyntheticDefaultImports).toBe(true);
    });

    test('include has vite.config.ts', () => {
      expect(nodeConfig.include).toContain('vite.config.ts');
    });
  });

  describe('TypeScript Configuration Hierarchy', () => {
    test('server tsconfig extends root tsconfig', () => {
      const serverConfigPath = path.join(ROOT_DIR, 'server/tsconfig.json');
      const serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf-8'));
      expect(serverConfig.extends).toBe('../tsconfig.json');
    });

    test('client tsconfig extends root tsconfig', () => {
      const clientConfigPath = path.join(ROOT_DIR, 'client/tsconfig.json');
      const clientConfig = JSON.parse(fs.readFileSync(clientConfigPath, 'utf-8'));
      expect(clientConfig.extends).toBe('../tsconfig.json');
    });

    test('client tsconfig.node.json has project reference to tsconfig.json', () => {
      const nodeConfigPath = path.join(ROOT_DIR, 'client/tsconfig.node.json');
      const nodeConfig = JSON.parse(fs.readFileSync(nodeConfigPath, 'utf-8'));
      expect(nodeConfig.compilerOptions.composite).toBe(true);
    });
  });
});
