import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

const customJestConfig: Config = {
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
  },
  testMatch: [
    "<rootDir>/src/__tests__/**/*.test.tsx",
    "<rootDir>/src/__tests__/**/*.test.ts",
  ],
  // Configurations to improve performance and avoid memory problems
  maxWorkers: 1,
  workerIdleMemoryLimit: "512MB",
  testTimeout: 10000,
  // Configurations to reduce warnings
  silent: false,
  verbose: false,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
