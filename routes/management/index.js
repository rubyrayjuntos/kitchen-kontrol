const express = require('express');
const router = express.Router();

const absencesRouter = require('./absences');
const rolesRouter = require('./roles');
const userRolesRouter = require('./user-roles');
const rolePhasesRouter = require('./role-phases');
const trainingModulesRouter = require('./training-modules');

router.use('/absences', absencesRouter);
router.use('/roles', rolesRouter);
router.use('/user-roles', userRolesRouter);
router.use('/role-phases', rolePhasesRouter);
router.use('/training-modules', trainingModulesRouter);

module.exports = router;
