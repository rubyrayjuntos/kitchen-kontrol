const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';
const noopMiddleware = (req, res, next) => next();

// General API rate limiter (only active in production)
const apiLimiter = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // allow generous headroom for dashboard bursts
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
  : noopMiddleware;

// Strict login rate limiter (only active in production)
const loginLimiter = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      skipSuccessfulRequests: true,
      keyGenerator: (req) => req.body?.email?.toLowerCase() || 'anonymous-login',
    })
  : noopMiddleware;

module.exports = { apiLimiter, loginLimiter };
