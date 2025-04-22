import Database from 'better-sqlite3';

const dbFile = process.env.NODE_ENV === 'test' ? 'test-items.db' : 'items.db';
const db = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    checked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
