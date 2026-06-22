import initSqlJs, { Database as SqlJsDb } from "sql.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { env } from "../utils/env";

interface Row {
  [key: string]: any;
}

let db: SqlJsDb | null = null;
let dbInitialized = false;

export async function initDb(): Promise<void> {
  if (dbInitialized) return;

  const SQL = await initSqlJs();
  const dbPath = path.resolve(env.DATABASE_PATH);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  initializeSchema();
  saveDb();
  seedDemoUser();
  dbInitialized = true;
}

function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const dbPath = path.resolve(env.DATABASE_PATH);
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function initializeSchema(): void {
  if (!db) return;
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS collection_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL,
      nasa_id TEXT NOT NULL,
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      thumbnail_url TEXT DEFAULT '',
      date_created TEXT DEFAULT '',
      metadata TEXT DEFAULT '{}',
      added_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )
  `);
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id)"
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_collection_images_collection_id ON collection_images(collection_id)"
  );
}

function seedDemoUser(): void {
  if (!db) return;

  const rows = queryAll("SELECT id FROM users WHERE email = ?", [
    "demo@demo.com",
  ]);
  if (rows.length > 0) return;

  const hashedPassword = bcrypt.hashSync("password123", 10);
  execute(
    "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
    ["demo@demo.com", hashedPassword, "Demo User"]
  );
  saveDb();
}

export function getDb(): SqlJsDb {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

export function queryAll(sql: string, params: any[] = []): Row[] {
  const d = getDb();
  const stmt = d.prepare(sql);
  stmt.bind(params);
  const rows: Row[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql: string, params: any[] = []): Row | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function execute(
  sql: string,
  params: any[] = []
): { changes: number; lastInsertRowid: number } {
  const d = getDb();
  d.run(sql, params);
  const result = {
    changes: d.getRowsModified(),
    lastInsertRowid: queryOne(
      "SELECT last_insert_rowid() as id"
    )?.id || 0,
  };
  saveDb();
  return result;
}

export function exists(table: string, column: string, value: any): boolean {
  const row = queryOne(
    `SELECT 1 as found FROM ${table} WHERE ${column} = ?`,
    [value]
  );
  return !!row;
}

export function closeDb(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
    dbInitialized = false;
  }
}
