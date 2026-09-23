import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('thrive.db');
  }

  return db;
}

export async function initializeDatabase() {
  const database = await getDb();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,

      subject TEXT,
      category TEXT,
      description TEXT,

      date TEXT,

      priority TEXT,
      progress INTEGER,

      duration INTEGER,
      mood TEXT,
      notes TEXT,

      status TEXT,
      is_favorite INTEGER DEFAULT 0
    );
  `);
}