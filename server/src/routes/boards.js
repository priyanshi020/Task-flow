const express = require('express');
const db = require('../db/connection');
const { taskCountsPerColumn, tasksByPriority } = require('../db/queries');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/boards/:id -> board with its columns and each column's tasks
router.get('/:id', asyncHandler((req, res) => {
  const boardId = Number(req.params.id);

  const board = db.prepare('SELECT id, name, created_at FROM boards WHERE id = ?').get(boardId);
  if (!board) throw new ApiError(404, 'Board not found');

  const columns = db
    .prepare('SELECT id, name, position FROM columns WHERE board_id = ? ORDER BY position ASC')
    .all(boardId);

  const taskStmt = db.prepare(
    'SELECT id, title, description, priority, created_at, column_id FROM tasks WHERE column_id = ? ORDER BY created_at ASC, id ASC'
  );

  const columnsWithTasks = columns.map((col) => ({
    ...col,
    tasks: taskStmt.all(col.id),
  }));

  res.json({ ...board, columns: columnsWithTasks });
}));

// GET /api/boards/:id/task-counts -> required query #1 (tasks per column)
router.get('/:id/task-counts', asyncHandler((req, res) => {
  const boardId = Number(req.params.id);
  res.json(taskCountsPerColumn(boardId));
}));

// GET /api/boards/:id/tasks?priority=High -> required query #2 (tasks by priority, newest first)
router.get('/:id/tasks', asyncHandler((req, res) => {
  const boardId = Number(req.params.id);
  const { priority } = req.query;

  if (!priority) throw new ApiError(400, 'priority query param is required');
  if (!['Low', 'Medium', 'High'].includes(priority)) {
    throw new ApiError(400, 'priority must be Low, Medium, or High');
  }

  res.json(tasksByPriority(boardId, priority));
}));

module.exports = router;
