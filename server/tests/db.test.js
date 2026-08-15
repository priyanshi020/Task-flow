const { taskCountsPerColumn, tasksByPriority } = require('../src/db/queries');
const { resetDatabase, closeDatabase, db } = require('./setup');

let boardId;

beforeAll(() => {
  boardId = resetDatabase();
});

afterAll(() => {
  closeDatabase();
});

describe('taskCountsPerColumn (required query #1)', () => {
  it('returns the correct task count for each column from seed data', () => {
    const counts = taskCountsPerColumn(boardId);

    // Seed data: To Do=3, In Progress=2, Done=2 (see src/db/seed.js)
    const byName = Object.fromEntries(counts.map((c) => [c.column_name, c.task_count]));

    expect(byName['To Do']).toBe(3);
    expect(byName['In Progress']).toBe(2);
    expect(byName['Done']).toBe(2);
  });

  it('includes columns with zero tasks (LEFT JOIN, not INNER JOIN)', () => {
    const emptyColId = db
      .prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)')
      .run(boardId, 'Backlog', 3).lastInsertRowid;

    const counts = taskCountsPerColumn(boardId);
    const backlog = counts.find((c) => c.column_id === emptyColId);

    expect(backlog).toBeDefined();
    expect(backlog.task_count).toBe(0);
  });
});

describe('tasksByPriority (required query #2)', () => {
  it('returns only tasks matching the given priority', () => {
    const highPriorityTasks = tasksByPriority(boardId, 'High');
    expect(highPriorityTasks.every((t) => t.priority === 'High')).toBe(true);
    // Seed data has exactly 2 High priority tasks.
    expect(highPriorityTasks.length).toBe(2);
  });

  it('returns tasks newest first', () => {
    const lowPriorityTasks = tasksByPriority(boardId, 'Low');
    const timestamps = lowPriorityTasks.map((t) => new Date(t.created_at).getTime());
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });
});
