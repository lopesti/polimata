import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

function createDatabase() {
  const dbPath =
    process.env.DATABASE_URL?.replace("file:", "") ??
    path.join(process.cwd(), "data", "polimata.db");

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);

  // Performance + safety PRAGMAs for local-first
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("cache_size = -64000"); // 64MB
  sqlite.pragma("temp_store = MEMORY");

  return sqlite;
}

export const sqlite = globalForDb.sqlite ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
