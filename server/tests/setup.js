// Jest sets NODE_ENV=test automatically, so src/db/connection.js points at
// db/test.sqlite for every test run — dev data is never touched.

const fs = require('fs');
const path = require('path');
const db = require('../src/db/connection');
const { runMigration } = require('../src/db/migrate');
const { runSeed } = require('../src/db/seed');

function resetDatabase() {
  runMigration();
  return runSeed();
}

function closeDatabase() {
  db.close();
  const testDbPath = path.join(__dirname, '..', 'src', 'db', 'test.sqlite');
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
}

module.exports = { resetDatabase, closeDatabase, db };
