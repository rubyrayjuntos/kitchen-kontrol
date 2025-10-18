const express = require('express');
const router = express.Router();
const { loginLimiter } = require('../../middleware/rateLimiter');

const authRouter = require('./auth');
const meRouter = require('./me');

router.use('/', loginLimiter, authRouter);
router.use('/me', meRouter);

module.exports = router;

