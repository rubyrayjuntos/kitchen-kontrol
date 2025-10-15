/**
 * Sentry Error Tracking Setup
 * Captures and reports application errors
 */

let Sentry;
try {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN || null,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    enabled: !!process.env.SENTRY_DSN,
  });
} catch (e) {
  console.warn('Sentry not installed. Error tracking disabled.');
  console.log('To enable error tracking, run: npm install @sentry/node');
  Sentry = {
    captureException: (err) => console.error('Uncaught error:', err),
    captureMessage: (msg) => console.log('Message:', msg),
    requestHandler: (req, res, next) => next(),
    errorHandler: (err, req, res, next) => next(err),
  };
}

// Middleware to capture request
const sentryRequestHandler = () => {
  return Sentry.requestHandler?.();
};

// Middleware to capture errors
const sentryErrorHandler = () => {
  return Sentry.errorHandler?.();
};

// Manual error reporting
const reportError = (error, context = {}) => {
  if (Sentry && Sentry.captureException) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error reported:', error, context);
  }
};

module.exports = {
  Sentry,
  sentryRequestHandler,
  sentryErrorHandler,
  reportError,
};
