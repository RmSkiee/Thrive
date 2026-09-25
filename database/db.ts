import * as SQLite from "expo-sqlite";

let dbPromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("thrive.db");
  }
  return await dbPromise;
};

export const initializeDatabase = async () => {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;


    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nickname TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT NOT NULL,
      mood TEXT,
      entry_date TEXT,
      bg_theme TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT CHECK (category IN ('assignment', 'goal', 'leisure')) NOT NULL,
      subject TEXT,
      due_date TEXT,
      priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
      status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
      progress INTEGER DEFAULT 0,
      duration_minutes INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS study_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      step_1_explanation TEXT,
      step_2_simplify TEXT,
      step_3_analogy TEXT,
      step_4_gaps TEXT,
      step_5_refined_understanding TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const journalColumns = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(journals);",
  );

  const hasBgTheme = journalColumns.some(
    (column) => column.name === "bg_theme",
  );

  if (!hasBgTheme) {
    await db.execAsync("ALTER TABLE journals ADD COLUMN bg_theme TEXT;");
  }

  const existingProfile = await db.getFirstAsync<any>(
    "SELECT * FROM profile WHERE id = 1;",
  );

  if (!existingProfile) {
    await db.runAsync("INSERT INTO profile (id, nickname) VALUES (1, ?);", [
      "Thea",
    ]);
  }

  return db;
};
