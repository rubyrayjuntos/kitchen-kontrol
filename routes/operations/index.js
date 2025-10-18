const express = require('express');
const router = express.Router();

const tasksRouter = require('./tasks');
const phasesRouter = require('./phases');
const planogramsRouter = require('./planograms');
const ingredientsRouter = require('./ingredients');

router.use('/tasks', tasksRouter);
router.use('/phases', phasesRouter);
router.use('/planograms', planogramsRouter);
router.use('/ingredients', ingredientsRouter);

module.exports = router;
