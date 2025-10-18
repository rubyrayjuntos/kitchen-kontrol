/**
 * Routes Index
 * 
 * This file aggregates all domain-based routes for backward compatibility
 * and centralized route management.
 * 
 * Organization:
 * - /auth - Authentication and authorization
 * - /management - Staff, roles, training management
 * - /logs - Logging system and submissions
 * - /operations - Kitchen operations (tasks, phases, planograms)
 * - /analytics - Reports and performance metrics
 * - /users - User management
 */

const express = require('express');
const router = express.Router();

// Import domain routers
const authRoutes = require('./auth');
const managementRoutes = require('./management');
const logsRoutes = require('./logs');
const operationsRoutes = require('./operations');
const analyticsRoutes = require('./analytics');
const usersRouter = require('./users');

// Mount domain-based routes
router.use('/auth', authRoutes);
router.use('/management', managementRoutes);
router.use('/logs', logsRoutes);
router.use('/operations', operationsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', usersRouter);

// Backward compatibility: mount operations routes at root level
// This allows /api/phases instead of /api/operations/phases
router.use('/phases', require('./operations/phases'));
router.use('/tasks', require('./operations/tasks'));
router.use('/planograms', require('./operations/planograms'));
router.use('/ingredients', require('./operations/ingredients'));

// Backward compatibility: mount management routes at root level
router.use('/roles', require('./management/roles'));
router.use('/absences', require('./management/absences'));
router.use('/user-roles', require('./management/user-roles'));
router.use('/role-phases', require('./management/role-phases'));
router.use('/training-modules', require('./management/training-modules'));

// Backward compatibility: mount analytics routes at root level
router.use('/reports', require('./analytics/reports'));
router.use('/performance', require('./analytics/performance'));

module.exports = router;
