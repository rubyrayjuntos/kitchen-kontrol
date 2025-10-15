/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

// Suppress console output during tests (unless TEST_VERBOSE=true)
if (!process.env.TEST_VERBOSE) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Add custom matchers or global test helpers if needed
expect.extend({
  toHaveValidJWT(received) {
    const pass = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
      received
    );
    return {
      pass,
      message: () =>
        pass
          ? `Expected token not to be a valid JWT`
          : `Expected token to be a valid JWT`,
    };
  },
});
