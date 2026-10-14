import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 35000,
    hookTimeout: 35000,
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret-min-32-characters-long',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/velora_test',
    },
  },
});
