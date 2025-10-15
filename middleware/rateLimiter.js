const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,      // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,       // Disable the `X-RateLimit-*` headers
});

// Strict login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 login attempts
  message: 'Too many login attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req, res) => {
    // Rate limit by email address for more precision
    return req.body?.email || req.ip;
  },
});

module.exports = { apiLimiter, loginLimiter };
