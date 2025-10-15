/**
 * Standardized Error Response Middleware
 * Provides consistent error format across all API endpoints
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Standard error response format
  const errorResponse = {
    status: 'error',
    statusCode: err.statusCode,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Handle specific error types
  if (err.code === '23505') {
    // PostgreSQL unique violation
    errorResponse.statusCode = 409;
    errorResponse.message = 'Duplicate entry';
    errorResponse.field = err.constraint;
  }

  if (err.name === 'ValidationError') {
    errorResponse.statusCode = 400;
    errorResponse.message = 'Validation failed';
    errorResponse.errors = err.details || err.message;
  }

  if (err.name === 'CastError') {
    errorResponse.statusCode = 400;
    errorResponse.message = 'Invalid ID format';
  }

  if (err.name === 'JsonWebTokenError') {
    errorResponse.statusCode = 401;
    errorResponse.message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse.statusCode = 401;
    errorResponse.message = 'Authentication token expired';
  }

  res.status(errorResponse.statusCode).json(errorResponse);
};

// Async error wrapper for express routes
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = { AppError, errorHandler, catchAsync };
