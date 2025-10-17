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


const phasesRouter = require('./routes/phases');
app.use('/api/phases', phasesRouter);

const rolesRouter = require('./routes/roles');
app.use('/api/roles', rolesRouter);

const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

const absencesRouter = require('./routes/absences');
app.use('/api/absences', absencesRouter);

// New logs system routes (MUST come BEFORE generic /api/logs)
console.log('Loading log-templates route...');
const logTemplatesRouter = require('./routes/log-templates');
app.use('/api/logs/templates', logTemplatesRouter);
console.log('✓ Registered /api/logs/templates');

console.log('Loading log-assignments route...');
const logAssignmentsRouter = require('./routes/log-assignments');
app.use('/api/logs/assignments', logAssignmentsRouter);
console.log('✓ Registered /api/logs/assignments');

console.log('Loading log-submissions route...');
const logSubmissionsRouter = require('./routes/log-submissions');
app.use('/api/logs/submissions', logSubmissionsRouter);
console.log('✓ Registered /api/logs/submissions');

// Old logs route (less specific, comes last)
const logsRouter = require('./routes/logs');
app.use('/api/logs', logsRouter);

// Reports routes
console.log('Loading reports route...');
const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);
console.log('✓ Registered /api/reports');

const planogramsRouter = require('./routes/planograms');
app.use('/api/planograms', planogramsRouter);

const ingredientsRouter = require('./routes/ingredients');
app.use('/api/ingredients', ingredientsRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', loginLimiter, authRouter);

const meRouter = require('./routes/me');
app.use('/api/me', meRouter);

const userRolesRouter = require('./routes/user-roles');
app.use('/api/user-roles', userRolesRouter);

const rolePhasesRouter = require('./routes/role-phases');
app.use('/api/role-phases', rolePhasesRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const trainingModulesRouter = require('./routes/training-modules');
app.use('/api/training-modules', trainingModulesRouter);

const auditLogRouter = require('./routes/audit-log');
app.use('/api/audit-log', auditLogRouter);

const performanceRouter = require('./routes/performance');
app.use('/api/performance', performanceRouter);



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
