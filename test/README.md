# Test Suite Documentation

This directory contains comprehensive tests for validating the social-app project structure and configuration.

## Test Files

### 1. `structure.test.ts`
Validates that all required configuration files and source files exist.

**Tests:**
- All required configuration files exist
- package.json files are valid JSON
- tsconfig.json files are valid JSON
- .env.example is valid
- .prettierrc is valid
- ESLint configs are valid JavaScript
- Jest config is valid JavaScript
- Vitest config is valid TypeScript
- Server and client source files exist
- Directory structure is correct

### 2. `package-json.test.ts`
Validates package.json files have correct structure, scripts, and dependencies.

**Tests:**
- Root package.json has required fields
- Root package.json has correct workspace setup
- Root package.json has all required scripts
- Server package.json has required fields
- Server package.json has all required dependencies
- Server package.json has all required devDependencies
- Client package.json has required fields
- Client package.json has all required dependencies
- Client package.json has all required devDependencies

### 3. `typescript-config.test.ts`
Validates TypeScript configurations are valid and properly extend each other.

**Tests:**
- Root tsconfig.json has required compiler options
- Server tsconfig.json extends root tsconfig.json
- Client tsconfig.json extends root tsconfig.json
- Client tsconfig.node.json has project reference
- TypeScript configuration hierarchy is correct

### 4. `lint-config.test.ts`
Validates ESLint configurations are valid and properly configured.

**Tests:**
- Server .eslintrc.js has required configuration
- Client .eslintrc.js has required configuration
- Both configs use same parser
- Both configs have consistent rules
- ESLint config files are valid

### 5. `test-config.test.ts`
Validates Jest and Vitest configurations are valid and properly configured.

**Tests:**
- Server jest.config.js has required configuration
- Client vitest.config.ts has required configuration
- Test configuration files are valid
- Test configurations are consistent

### 6. `source-files.test.ts`
Validates source files are syntactically correct TypeScript/TSX.

**Tests:**
- Server source files have correct structure
- Client source files have correct structure
- Source files contain required imports
- Source files have proper React/Express setup
- Source file syntax is valid

### 7. `env.test.ts`
Validates .env.example contains all necessary variables.

**Tests:**
- .env.example exists and is valid
- Server configuration variables are present
- Database variables are present
- JWT Secret variables are present
- Cloudinary variables are present
- CORS variables are present
- All required variables are present
- All variables are properly quoted

### 8. `index.test.ts`
Main test entry point that imports and runs all test suites.

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Run structure tests
npm test -- structure.test.ts

# Run package.json tests
npm test -- package-json.test.ts

# Run TypeScript config tests
npm test -- typescript-config.test.ts

# Run ESLint config tests
npm test -- lint-config.test.ts

# Run test config tests
npm test -- test-config.test.ts

# Run source files tests
npm test -- source-files.test.ts

# Run environment variable tests
npm test -- env.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage
```

## Expected Results

All tests should pass if the project structure and configuration files are correctly set up. If a test fails, it indicates:

1. A configuration file is missing or malformed
2. A package.json is missing required fields or dependencies
3. A TypeScript configuration is invalid
4. An ESLint configuration is invalid
5. A test configuration is invalid
6. A source file has syntax errors
7. An environment variable is missing

## Test Framework

- **Server Tests**: Jest with ts-jest preset
- **Client Tests**: Vitest with jsdom environment
- **TypeScript**: TypeScript 5.3.3
- **Testing Libraries**: @testing-library/react, @testing-library/jest-dom

## Continuous Integration

These tests are designed to run in CI/CD pipelines to ensure project structure remains valid after changes.
