import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize schema
export async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        barcode TEXT UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity TEXT,
        image_url TEXT,
        classification_confidence REAL,
        weight_version INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        type TEXT CHECK(type IN ('chain', 'pharmacy', 'shop', 'unknown')) DEFAULT 'unknown',
        trust_score REAL DEFAULT 0.2,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        barcode TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        predicted_category TEXT NOT NULL,
        correct_category TEXT NOT NULL,
        trust_score REAL DEFAULT 0.2,
        applied INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS classifier_state (
        id TEXT PRIMARY KEY,
        weights TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dataset_versions (
        version TEXT PRIMARY KEY,
        product_count INTEGER,
        avg_confidence REAL,
        exported_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_customer_feedback ON feedback(customer_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_applied ON feedback(applied);
    `);
  } finally {
    client.release();
  }
}

export { pool };
export default pool;