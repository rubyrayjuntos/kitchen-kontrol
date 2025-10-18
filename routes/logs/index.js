const express = require('express');
const router = express.Router();

const logsRouter = require('./logs');
const logTemplatesRouter = require('./log-templates');
const logAssignmentsRouter = require('./log-assignments');
const logSubmissionsRouter = require('./log-submissions');
const auditLogRouter = require('./audit-log');

// Specific routes must come before generic /logs
router.use('/templates', logTemplatesRouter);
router.use('/assignments', logAssignmentsRouter);
router.use('/submissions', logSubmissionsRouter);
router.use('/audit', auditLogRouter);

// Generic logs route (less specific, comes last)
router.use('/', logsRouter);

module.exports = router;
