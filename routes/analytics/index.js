const express = require('express');
const router = express.Router();

const reportsRouter = require('./reports');
const performanceRouter = require('./performance');

router.use('/reports', reportsRouter);
router.use('/performance', performanceRouter);

module.exports = router;
