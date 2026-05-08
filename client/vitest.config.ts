import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'test/',
        'tests/',
        '__tests__/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/app/issues/social-app/add51c17-f66d-4581-a8eb-26c89bb572ed',
    },
  },
});
