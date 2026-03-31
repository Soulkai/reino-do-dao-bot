const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { env } = require('../../config');

let db;

function getDb() {
  if (db) return db;

  const absolutePath = path.resolve(env.dbPath);
  const dir = path.dirname(absolutePath);
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(absolutePath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  return db;
}

module.exports = { getDb };
