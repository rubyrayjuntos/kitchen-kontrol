// Quick test script to verify routes work
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Test: Load route without auth
const logTemplatesRouter = require('./routes/log-templates');
app.use('/api/logs/templates', logTemplatesRouter);

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
