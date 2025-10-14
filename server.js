require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

app.get('/api', (req, res) => {
    res.json({ message: 'Kitchen Kontrol API is running!' });
});


const phasesRouter = require('./routes/phases');
app.use('/api/phases', phasesRouter);

const rolesRouter = require('./routes/roles');
app.use('/api/roles', rolesRouter);

const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

const absencesRouter = require('./routes/absences');
app.use('/api/absences', absencesRouter);

// New logs system routes (MUST come BEFORE generic /api/logs)
console.log('Loading log-templates route...');
const logTemplatesRouter = require('./routes/log-templates');
app.use('/api/logs/templates', logTemplatesRouter);
console.log('✓ Registered /api/logs/templates');

console.log('Loading log-assignments route...');
const logAssignmentsRouter = require('./routes/log-assignments');
app.use('/api/logs/assignments', logAssignmentsRouter);
console.log('✓ Registered /api/logs/assignments');

console.log('Loading log-submissions route...');
const logSubmissionsRouter = require('./routes/log-submissions');
app.use('/api/logs/submissions', logSubmissionsRouter);
console.log('✓ Registered /api/logs/submissions');

// Old logs route (less specific, comes last)
const logsRouter = require('./routes/logs');
app.use('/api/logs', logsRouter);

// Reports routes
console.log('Loading reports route...');
const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);
console.log('✓ Registered /api/reports');

const planogramsRouter = require('./routes/planograms');
app.use('/api/planograms', planogramsRouter);

const ingredientsRouter = require('./routes/ingredients');
app.use('/api/ingredients', ingredientsRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const meRouter = require('./routes/me');
app.use('/api/me', meRouter);

const userRolesRouter = require('./routes/user-roles');
app.use('/api/user-roles', userRolesRouter);

const rolePhasesRouter = require('./routes/role-phases');
app.use('/api/role-phases', rolePhasesRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const trainingModulesRouter = require('./routes/training-modules');
app.use('/api/training-modules', trainingModulesRouter);

const auditLogRouter = require('./routes/audit-log');
app.use('/api/audit-log', auditLogRouter);

const performanceRouter = require('./routes/performance');
app.use('/api/performance', performanceRouter);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error caught by middleware:', err.stack);
    
    // Check if it's a database constraint error
    if (err.code === '23505') { // PostgreSQL unique violation
        return res.status(409).json({ 
            error: 'Duplicate entry', 
            message: err.detail || 'A record with this value already exists',
            field: err.constraint 
        });
    }
    
    // Check if it's a validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Validation failed', 
            message: err.message 
        });
    }
    
    // Generic error response
    res.status(err.status || 500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// We will add more specific API endpoints here later

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
