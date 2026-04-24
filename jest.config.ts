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
  // Allow d3 ESM packages to be transformed by Babel
  transformIgnorePatterns: [
    '/node_modules/(?!(d3|d3-array|d3-color|d3-format|d3-hierarchy|d3-interpolate|d3-path|d3-scale|d3-selection|d3-shape|d3-time|d3-time-format|d3-zoom|d3-drag|d3-ease|d3-brush|d3-chord|d3-contour|d3-delaunay|d3-dispatch|d3-dsv|d3-fetch|d3-force|d3-geo|d3-quadtree|d3-random|d3-sankey|d3-scale-chromatic|d3-tile|d3-transition|internmap|robust-predicates|delaunator)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// We wrap it to override transformIgnorePatterns after next/jest sets its defaults
const jestConfig = createJestConfig(customJestConfig);
export default async () => {
  const config = await jestConfig();
  config.transformIgnorePatterns = [
    '/node_modules/(?!(d3|d3-array|d3-axis|d3-brush|d3-chord|d3-color|d3-contour|d3-delaunay|d3-dispatch|d3-drag|d3-dsv|d3-ease|d3-fetch|d3-force|d3-format|d3-geo|d3-hierarchy|d3-interpolate|d3-path|d3-polygon|d3-quadtree|d3-random|d3-scale|d3-scale-chromatic|d3-selection|d3-shape|d3-time|d3-time-format|d3-timer|d3-transition|d3-zoom|internmap|robust-predicates|delaunator)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ];
  return config;
};
