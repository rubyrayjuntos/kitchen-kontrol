require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { apiLimiter, loginLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');
const { sentryRequestHandler, sentryErrorHandler } = require('./middleware/errorTracking');
const { startOutboxRelay } = require('./services/events/outboxRelay');

const app = express();

// Sentry request handler (must be first)
app.use(sentryRequestHandler());

// CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request logging
app.use(requestLogger);

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

const PORT = process.env.PORT || 3002;

app.get('/api', (req, res) => {
    res.json({ message: 'Kitchen Kontrol API is running!' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// Import all routes (centrally managed)
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Error handling middleware
// Sentry error handler (must come before custom error handler)
app.use(sentryErrorHandler());

// Custom error handler (must be last)
app.use(errorHandler);

// We will add more specific API endpoints here later

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    if (process.env.ENABLE_OUTBOX_RELAY !== 'false') {
        startOutboxRelay();
    } else {
        logger.info('Outbox relay disabled via ENABLE_OUTBOX_RELAY flag.');
    }
});
