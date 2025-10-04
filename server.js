
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002;

app.get("/api", (req, res) => {
    res.json({ message: "Kitchen Kontrol API is running!" });
});


const phasesRouter = require('./routes/phases');
app.use('/api/phases', phasesRouter);

const rolesRouter = require('./routes/roles');
app.use('/api/roles', rolesRouter);

const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

const absencesRouter = require('./routes/absences');
app.use('/api/absences', absencesRouter);

const logsRouter = require('./routes/logs');
app.use('/api/logs', logsRouter);

const planogramsRouter = require('./routes/planograms');
app.use('/api/planograms', planogramsRouter);

const ingredientsRouter = require('./routes/ingredients');
app.use('/api/ingredients', ingredientsRouter);

const trainingModulesRouter = require('./routes/training-modules');
app.use('/api/training-modules', trainingModulesRouter);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// We will add more specific API endpoints here later

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
