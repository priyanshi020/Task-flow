const db = require('./connection');

/**
 * Required query #1: count of tasks per column, for a given board.
 * Uses LEFT JOIN + GROUP BY so columns with zero tasks still show up (count 0).
 */
function taskCountsPerColumn(boardId) {
  const stmt = db.prepare(`
    SELECT
      c.id            AS column_id,
      c.name          AS column_name,
      c.position      AS position,
      COUNT(t.id)     AS task_count
    FROM columns c
    LEFT JOIN tasks t ON t.column_id = c.id
    WHERE c.board_id = ?
    GROUP BY c.id, c.name, c.position
    ORDER BY c.position ASC
  `);
  return stmt.all(boardId);
}

/**
 * Required query #2: tasks with a given priority on a board, newest first.
 * Joins through columns to scope to a single board.
 */
function tasksByPriority(boardId, priority) {
  const stmt = db.prepare(`
    SELECT
      t.id, t.title, t.description, t.priority, t.created_at,
      t.column_id, c.name AS column_name
    FROM tasks t
    JOIN columns c ON c.id = t.column_id
    WHERE c.board_id = ? AND t.priority = ?
    ORDER BY t.created_at DESC, t.id DESC
  `);
  return stmt.all(boardId, priority);
}

module.exports = { taskCountsPerColumn, tasksByPriority };
