import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize database
const initDb = async () => {
  const dbFile = process.env.NODE_ENV === 'test' ? 'test-items.db' : 'items.db';
  const dbPath = path.join(__dirname, '..', dbFile);

  // For tests, remove existing database
  if (process.env.NODE_ENV === 'test' && existsSync(dbPath)) {
    await unlink(dbPath);
  }

  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};

const db = await initDb();

export default db;
