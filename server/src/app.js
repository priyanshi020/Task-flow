const express = require('express');
const cors = require('cors');

const boardsRouter = require('./routes/boards');
const tasksRouter = require('./routes/tasks');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/boards', boardsRouter);
app.use('/api/tasks', tasksRouter);

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use(errorHandler);

module.exports = app;
