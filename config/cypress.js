const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base URL for tests
    baseUrl: 'http://localhost:3000',

    // Test files glob pattern
    specPattern: 'cypress/e2e/**/*.cy.js',

    // Screenshots configuration
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    // Video configuration
    video: true,
    videosFolder: 'cypress/videos',
    videoCompression: 32,

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    execTimeout: 60000,
    pageLoadTimeout: 60000,
    taskTimeout: 60000,

    // Viewports
    viewportWidth: 1280,
    viewportHeight: 720,

    // Browser and testing
    browser: 'chrome',
    headed: false,
    numTestsKeptInMemory: 1,

    // Retries
    retries: {
      runMode: 1,
      openMode: 0,
    },

    // Experimental features
    experimentalSessionAndOrigin: true,

    // API settings
    env: {
      apiUrl: 'http://localhost:3001',
      testUser: 'admin@example.com',
      testPassword: 'AdminPass123',
    },

    // Setup node events
    setupNodeEvents(on, config) {
      // Example: Custom task for database operations
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });

      // Return modified config
      return config;
    },
  },

  // Component testing (optional)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/components/**/*.cy.{js,jsx,ts,tsx}',
  },
});
