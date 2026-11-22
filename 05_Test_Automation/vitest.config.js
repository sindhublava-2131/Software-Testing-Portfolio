import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        isolate: true
      }
    },
    setupFiles: [
      path.resolve(__dirname, './setup/env.js'),
      path.resolve(__dirname, './setup/mocks.js')
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      include: ['../.sut/server/**/*.js'],
      exclude: ['**/scripts/**', '**/server.js', '**/node_modules/**', '**/*.test.js'],
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: path.resolve(__dirname, '../06_Test_Reports/coverage')
    },
    reporters: ['default', 'json'],
    outputFile: path.resolve(__dirname, '../03_Test_Execution/raw/vitest.json')
  }
});
