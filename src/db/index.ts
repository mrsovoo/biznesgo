import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export let pool: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!pool) {
    if (!config.databaseUrl) {
      console.warn("⚠️ DATABASE_URL aniqlanmadi. Ma'lumotlar bazasi ulanmadi.");
    }
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseUrl.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function initDb() {
  if (!config.databaseUrl) {
    console.warn("⚠️ Neon PostgreSQL DATABASE_URL kiritilmagan. .env fayliga DATABASE_URL qo'shing.");
    return false;
  }

  try {
    const db = getDbPool();
    await db.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id SERIAL PRIMARY KEY,
        telegram_user_id BIGINT NOT NULL,
        telegram_username VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity VARCHAR(100) NOT NULL,
        photo_file_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE medicines ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE medicines ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE medicines ADD COLUMN IF NOT EXISTS source_url TEXT;
      ALTER TABLE medicines ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(telegram_user_id);
      CREATE INDEX IF NOT EXISTS idx_medicines_created_at ON medicines(created_at DESC);

      CREATE TABLE IF NOT EXISTS commits (
        id SERIAL PRIMARY KEY,
        sha VARCHAR(40) NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_avatar TEXT,
        message TEXT NOT NULL,
        folder VARCHAR(50),
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE commits ADD COLUMN IF NOT EXISTS folder VARCHAR(50);
      CREATE INDEX IF NOT EXISTS idx_commits_created_at ON commits(created_at DESC);

      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        source VARCHAR(100) NOT NULL,
        target VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        operator VARCHAR(255) NOT NULL,
        ip_address VARCHAR(100),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit_logs(created_at DESC);
    `);
    console.log("✅ Neon PostgreSQL ma'lumotlar bazasi muvaffaqiyatli ulandi va jadval tayyor!");
    return true;
  } catch (error) {
    console.error("❌ Ma'lumotlar bazasiga ulanishda xatolik:", error);
    return false;
  }
}

