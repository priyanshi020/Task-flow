const fs = require('fs');
const path = require('path');
const db = require('./connection');

function runMigration() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

if (require.main === module) {
  runMigration();
  console.log(`Migration applied to ${db.name}`);
}

module.exports = { runMigration };
