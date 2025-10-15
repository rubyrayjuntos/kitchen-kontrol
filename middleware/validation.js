/**
 * Input Validation Schemas & Middleware
 * Centralized validation rules for all API endpoints
 * Uses express-validator for consistent validation
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation result handler middleware
 * Call this after all validation checks to handle errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        value: err.value,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * AUTH VALIDATION SCHEMAS
 */
const authValidation = {
  // POST /api/auth/login
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1 })
      .withMessage('Password cannot be empty'),
    handleValidationErrors,
  ],

  // POST /api/auth/register
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number'),
    handleValidationErrors,
  ],
};

/**
 * LOG SUBMISSION VALIDATION SCHEMAS
 */
const logSubmissionValidation = {
  // POST /api/logs/submissions
  create: [
    body('log_template_id')
      .isInt({ min: 1 })
      .withMessage('log_template_id must be a positive integer'),
    body('form_data')
      .isObject()
      .withMessage('form_data must be an object')
      .custom((value) => Object.keys(value).length > 0)
      .withMessage('form_data cannot be empty'),
    body('submission_date')
      .optional()
      .isISO8601()
      .withMessage('submission_date must be a valid ISO 8601 date'),
    body('log_assignment_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('log_assignment_id must be a positive integer'),
    handleValidationErrors,
  ],

  // PUT /api/logs/submissions/:id
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('log_template_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('log_template_id must be a positive integer'),
    body('form_data')
      .optional()
      .isObject()
      .withMessage('form_data must be an object'),
    body('submission_date')
      .optional()
      .isISO8601()
      .withMessage('submission_date must be a valid ISO 8601 date'),
    handleValidationErrors,
  ],

  // GET /api/logs/submissions/:id
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors,
  ],
};

/**
 * USER MANAGEMENT VALIDATION SCHEMAS
 */
const userValidation = {
  // POST /api/users
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    handleValidationErrors,
  ],

  // PUT /api/users/:id
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    handleValidationErrors,
  ],

  // GET /api/users/:id
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors,
  ],
};

/**
 * ROLE MANAGEMENT VALIDATION SCHEMAS
 */
const roleValidation = {
  // POST /api/roles
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be 2-50 characters')
      .matches(/^[a-zA-Z\s_-]+$/)
      .withMessage('Name can only contain letters, spaces, underscores, and hyphens'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be 500 characters or less'),
    handleValidationErrors,
  ],

  // PUT /api/roles/:id
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be 2-50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be 500 characters or less'),
    handleValidationErrors,
  ],

  // GET /api/roles/:id
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors,
  ],

  // POST /api/roles/assign
  assign: [
    body('userId')
      .isInt({ min: 1 })
      .withMessage('userId must be a positive integer'),
    body('roleId')
      .notEmpty()
      .withMessage('roleId is required'),
    handleValidationErrors,
  ],
};

/**
 * PHASE MANAGEMENT VALIDATION SCHEMAS
 */
const phaseValidation = {
  // POST /api/phases
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be 2-50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be 500 characters or less'),
    body('start_time')
      .optional()
      .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
      .withMessage('start_time must be in HH:MM format'),
    body('end_time')
      .optional()
      .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
      .withMessage('end_time must be in HH:MM format'),
    handleValidationErrors,
  ],

  // PUT /api/phases/:id
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be 2-50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be 500 characters or less'),
    body('start_time')
      .optional()
      .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
      .withMessage('start_time must be in HH:MM format'),
    body('end_time')
      .optional()
      .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
      .withMessage('end_time must be in HH:MM format'),
    handleValidationErrors,
  ],

  // GET /api/phases/:id
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors,
  ],
};

/**
 * TASK MANAGEMENT VALIDATION SCHEMAS
 */
const taskValidation = {
  // POST /api/tasks
  create: [
    body('phase_id')
      .isInt({ min: 1 })
      .withMessage('phase_id must be a positive integer'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be 500 characters or less'),
    handleValidationErrors,
  ],

  // PUT /api/tasks/:id
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be 500 characters or less'),
    handleValidationErrors,
  ],

  // GET /api/tasks/:id
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors,
  ],
};

/**
 * LOG ASSIGNMENT VALIDATION SCHEMAS
 */
const logAssignmentValidation = {
  // POST /api/logs/assignments
  create: [
    body('log_template_id')
      .isInt({ min: 1 })
      .withMessage('log_template_id must be a positive integer'),
    body('user_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('user_id must be a positive integer'),
    body('role_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('role_id must be a positive integer'),
    body('phase_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('phase_id must be a positive integer'),
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('start_date must be a valid ISO 8601 date'),
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('end_date must be a valid ISO 8601 date'),
    handleValidationErrors,
  ],

  // PUT /api/logs/assignments/:id
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('start_date must be a valid ISO 8601 date'),
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('end_date must be a valid ISO 8601 date'),
    handleValidationErrors,
  ],
};

module.exports = {
  handleValidationErrors,
  authValidation,
  logSubmissionValidation,
  userValidation,
  roleValidation,
  phaseValidation,
  taskValidation,
  logAssignmentValidation,
};
