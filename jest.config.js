module.exports = {
  // Test environment
  testEnvironment: "node",

  // Coverage configuration
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/tests/**",
    "!jest.config.js",
    "!index.js", // Entry point, tested via integration tests
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    "./services/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html", "json-summary"],

  // Test match patterns
  testMatch: [
    "**/tests/**/*.test.js",
    "**/tests/**/*.spec.js",
    "**/__tests__/**/*.js",
  ],

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Global teardown
  globalTeardown: "<rootDir>/tests/teardown.js",

  // Timeout for tests (30 seconds)
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Module paths
  moduleDirectories: ["node_modules", "<rootDir>"],

  // Transform ignore patterns
  transformIgnorePatterns: ["/node_modules/(?!(@faker-js)/)"],

  // Collect coverage from
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
    "/tests/",
    "/docs/",
    "/.github/",
    "/.husky/",
  ],

  // Test environment options
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Max workers (parallel test execution)
  maxWorkers: "50%",
};
