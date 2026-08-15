const path = require('path');
const Database = require('better-sqlite3');

// Use a separate DB file for tests so `npm test` never touches dev data.
const dbFile = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, 'test.sqlite')
  : path.join(__dirname, 'taskflow.sqlite');

const db = new Database(dbFile);
db.pragma('foreign_keys = ON');

module.exports = db;
