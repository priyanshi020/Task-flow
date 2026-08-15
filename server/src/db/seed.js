const db = require('./connection');

function runSeed() {
  // Wipe existing data (order matters because of FK constraints).
  db.exec('DELETE FROM tasks; DELETE FROM columns; DELETE FROM boards;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tasks','columns','boards');");

  const insertBoard = db.prepare('INSERT INTO boards (name) VALUES (?)');
  const insertColumn = db.prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)');
  const insertTask = db.prepare(
    'INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)'
  );

  const seed = db.transaction(() => {
    const boardId = insertBoard.run('TaskFlow Demo Board').lastInsertRowid;

    const todoId = insertColumn.run(boardId, 'To Do', 0).lastInsertRowid;
    const inProgressId = insertColumn.run(boardId, 'In Progress', 1).lastInsertRowid;
    const doneId = insertColumn.run(boardId, 'Done', 2).lastInsertRowid;

    insertTask.run(todoId, 'Set up project repo', 'Initialize frontend and backend folders', 'Medium');
    insertTask.run(todoId, 'Design database schema', 'Boards, columns, tasks with FKs', 'High');
    insertTask.run(todoId, 'Write README', null, 'Low');

    insertTask.run(inProgressId, 'Build task CRUD API', 'Create/edit/delete/move endpoints', 'High');
    insertTask.run(inProgressId, 'Build board UI', 'Columns + task cards', 'Medium');

    insertTask.run(doneId, 'Project kickoff', 'Requirements reviewed', 'Low');
    insertTask.run(doneId, 'Repo created', null, 'Low');

    return boardId;
  });

  return seed();
}

if (require.main === module) {
  const boardId = runSeed();
  console.log(`Seeded database. Demo board id = ${boardId}`);
}

module.exports = { runSeed };
