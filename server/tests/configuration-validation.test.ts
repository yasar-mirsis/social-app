import { readFileSync } from 'fs';
import path from 'path';

describe('Server Configuration Validation', () => {
  describe('Environment Variables', () => {
    it('should have .env.example file', () => {
      const envExamplePath = path.join(__dirname, '../.env.example');
      expect(envExamplePath).toBeTruthy();

      const content = readFileSync(envExamplePath, 'utf-8');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    });

    it('should have required environment variables documented', () => {
      const envExamplePath = path.join(__dirname, '../.env.example');
      const content = readFileSync(envExamplePath, 'utf-8');

      // Check for common environment variable patterns
      expect(content).toMatch(/PORT/);
      expect(content).toMatch(/NODE_ENV/);
    });

    it('should have valid .env.example format', () => {
      const envExamplePath = path.join(__dirname, '../.env.example');
      const content = readFileSync(envExamplePath, 'utf-8');

      // Should not have empty lines at the start or end
      const trimmedContent = content.trim();
      expect(trimmedContent.length).toBeGreaterThan(0);

      // Should have some content
      expect(trimmedContent).toContain('=');
    });
  });

  describe('Package.json Configuration', () => {
    it('should have valid package.json', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const content = readFileSync(packageJsonPath, 'utf-8');

      expect(content).toBeTruthy();
      expect(content).toContain('name');
      expect(content).toContain('version');
    });

    it('should have test script defined', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const content = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts.test).toBe('jest');
    });

    it('should have dev script defined', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const content = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts.dev).toBe('ts-node-dev --respawn --transpile-only src/index.ts');
    });

    it('should have build script defined', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const content = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.build).toBe('tsc');
    });

    it('should have required dependencies', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const content = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const requiredDeps = ['express', 'cors', 'dotenv', 'bcryptjs', 'jsonwebtoken'];
      requiredDeps.forEach((dep) => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have required devDependencies', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const content = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const requiredDevDeps = [
        '@types/express',
        '@types/cors',
        '@types/node',
        '@types/bcryptjs',
        '@types/jsonwebtoken',
        'typescript',
        'ts-node-dev',
        'jest',
        'ts-jest',
      ];
      requiredDevDeps.forEach((dep) => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have valid tsconfig.json', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      const content = readFileSync(tsconfigPath, 'utf-8');

      expect(content).toBeTruthy();
      expect(content).toContain('compilerOptions');
    });

    it('should have correct target version', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      const content = readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions).toHaveProperty('target');
      expect(tsconfig.compilerOptions.target).toBe('ES2020');
    });

    it('should have module configuration', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      const content = readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions).toHaveProperty('module');
      expect(tsconfig.compilerOptions.module).toBe('commonjs');
    });

    it('should have strict mode enabled', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      const content = readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions).toHaveProperty('strict');
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    it('should have correct output directory', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      const content = readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions).toHaveProperty('outDir');
      expect(tsconfig.compilerOptions.outDir).toBe('./dist');
    });

    it('should have correct root directory', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      const content = readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions).toHaveProperty('rootDir');
      expect(tsconfig.compilerOptions.rootDir).toBe('./src');
    });
  });

  describe('Node.js Version Requirements', () => {
    it('should have node version requirement in package.json', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const content = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.engines).toHaveProperty('node');
      expect(packageJson.engines.node).toBe('>=18.0.0');
    });
  });
});
