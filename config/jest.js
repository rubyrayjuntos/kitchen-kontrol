module.exports = {
  // Test environment - use jsdom for frontend, node for backend
  testEnvironment: 'jsdom',

  // Test match patterns - include both backend and frontend tests
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx',
    'src/**/*.test.js',
    'src/**/*.test.jsx',
    '!node_modules/**',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    'node_modules',
    'coverage',
    'build',
  ],

  // Coverage settings - include both frontend and backend
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'src/components/**/*.{js,jsx}',
    'src/hooks/**/*.{js,jsx}',
    'src/utils/**/*.{js,jsx}',
    '!middleware/rateLimiter.js',
    '!middleware/logger.js',
    '!middleware/errorTracking.js',
    '!src/**/*.old.js',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],

  coveragePathIgnorePatterns: [
    'node_modules',
    '__tests__',
    '.test.',
  ],

  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1,
    },
  },

  // Setup files for both backend and frontend
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup.js',
    '<rootDir>/src/setupTests.js',
  ],

  // Module paths
  moduleDirectories: ['node_modules', '.'],

  // Module name mapper for CSS and other assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },

  // Timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Coverage reporter
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Don't transform node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(express-validator|zustand)/)',
  ],

  // Test scripts
  testScript: 'jest',
};

