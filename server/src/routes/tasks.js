const express = require('express');
const db = require('../db/connection');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

function validateTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ApiError(400, 'Title is required and cannot be empty');
  }
}

function validatePriority(priority) {
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    throw new ApiError(400, `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
}

// POST /api/tasks -> create a task
router.post('/', asyncHandler((req, res) => {
  const { columnId, title, description, priority } = req.body;

  validateTitle(title);
  validatePriority(priority);

  const column = db.prepare('SELECT id FROM columns WHERE id = ?').get(columnId);
  if (!column) throw new ApiError(400, 'columnId does not refer to an existing column');

  const result = db
    .prepare('INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)')
    .run(columnId, title.trim(), description || null, priority || 'Medium');

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
}));

// PUT /api/tasks/:id -> edit title/description/priority
router.put('/:id', asyncHandler((req, res) => {
  const taskId = Number(req.params.id);
  const { title, description, priority } = req.body;

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!existing) throw new ApiError(404, 'Task not found');

  validateTitle(title);
  validatePriority(priority);

  db.prepare('UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?').run(
    title.trim(),
    description || null,
    priority || existing.priority,
    taskId
  );

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  res.json(updated);
}));

// PATCH /api/tasks/:id/move -> move a task to a different column
router.patch('/:id/move', asyncHandler((req, res) => {
  const taskId = Number(req.params.id);
  const { columnId } = req.body;

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!existing) throw new ApiError(404, 'Task not found');

  const column = db.prepare('SELECT id FROM columns WHERE id = ?').get(columnId);
  if (!column) throw new ApiError(400, 'columnId does not refer to an existing column');

  db.prepare('UPDATE tasks SET column_id = ? WHERE id = ?').run(columnId, taskId);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  res.json(updated);
}));

// DELETE /api/tasks/:id
router.delete('/:id', asyncHandler((req, res) => {
  const taskId = Number(req.params.id);
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!existing) throw new ApiError(404, 'Task not found');

  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  res.status(204).send();
}));

module.exports = router;
