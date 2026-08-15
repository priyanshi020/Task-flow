const request = require('supertest');
const app = require('../src/app');
const { resetDatabase, closeDatabase, db } = require('./setup');

let boardId;
let columns;

beforeAll(() => {
  boardId = resetDatabase();
  columns = db.prepare('SELECT id, name FROM columns WHERE board_id = ? ORDER BY position').all(boardId);
});

afterAll(() => {
  closeDatabase();
});

describe('POST /api/tasks', () => {
  it('rejects creating a task with no title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ columnId: columns[0].id, title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('rejects a title that is only whitespace', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ columnId: columns[0].id, title: '    ' });

    expect(res.status).toBe(400);
  });

  it('creates a task with a valid title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ columnId: columns[0].id, title: 'New task', priority: 'High' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New task');
    expect(res.body.priority).toBe('High');
  });
});

describe('PATCH /api/tasks/:id/move', () => {
  it('moves a task to a different column and persists the change', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ columnId: columns[0].id, title: 'Task to move' });

    const taskId = created.body.id;
    const targetColumnId = columns[1].id;

    const moveRes = await request(app)
      .patch(`/api/tasks/${taskId}/move`)
      .send({ columnId: targetColumnId });

    expect(moveRes.status).toBe(200);
    expect(moveRes.body.column_id).toBe(targetColumnId);

    // Confirm it's actually persisted in the DB, not just in the response.
    const row = db.prepare('SELECT column_id FROM tasks WHERE id = ?').get(taskId);
    expect(row.column_id).toBe(targetColumnId);
  });

  it('returns 400 when moving to a column that does not exist', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ columnId: columns[0].id, title: 'Another task' });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/move`)
      .send({ columnId: 999999 });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ columnId: columns[0].id, title: 'To be deleted' });

    const del = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(del.status).toBe(204);

    const row = db.prepare('SELECT id FROM tasks WHERE id = ?').get(created.body.id);
    expect(row).toBeUndefined();
  });
});
