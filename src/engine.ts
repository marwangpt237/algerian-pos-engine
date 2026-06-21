import crypto from "crypto";
import Database from "better-sqlite3";
import { Product, Category } from "./types";
import { fetchProducts } from "./stages/fetch";
import { cleanBrand, normalizeQuantity } from "./stages/normalize";
import { createClassifier } from "./stages/classify";
import { deduplicate } from "./stages/deduplicate";
import { reweightClassifier } from "./stages/reweight";
import { exportDataset } from "./stages/export";

export async function runDataEngine(dbPath: string = "./products.db"): Promise<void> {
  console.log("[ENGINE] Starting data product engine...\n");

  const db = new Database(dbPath);

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      barcode TEXT UNIQUE NOT NULL,
      product_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity TEXT,
      image_url TEXT,
      classification_confidence REAL,
      weight_version INTEGER,
      created_at TEXT,
      last_updated TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      type TEXT CHECK(type IN ('chain', 'pharmacy', 'shop', 'unknown')),
      trust_score REAL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      barcode TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      predicted_category TEXT NOT NULL,
      correct_category TEXT NOT NULL,
      trust_score REAL,
      applied INTEGER,
      created_at TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS classifier_state (
      id TEXT PRIMARY KEY,
      weights TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS dataset_versions (
      version TEXT PRIMARY KEY,
      product_count INTEGER,
      avg_confidence REAL,
      exported_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_customer_feedback ON feedback(customer_id);
  `);

  try {
    // Stage 1: Fetch
    const raw = await fetchProducts();

    // Stage 2: Normalize & Classify
    const classifier = createClassifier(db);
    const normalized: Product[] = [];

    for (const p of raw) {
      if (!p.code || p.code.length < 8) continue;

      const name = (p.product_name_fr || p.product_name || "").trim();
      if (!name || name.length <= 2 || /^\d+$/.test(name)) continue;

      const result = classifier.classify(name, p.brands || "");

      normalized.push({
        id: crypto.randomUUID(),
        barcode: p.code,
        product_name: name,
        brand: cleanBrand(p.brands || ""),
        category: result.category,
        quantity: normalizeQuantity(p.quantity),
        image_url: p.image_url || null,
        classification_confidence: result.confidence,
        weight_version: 1,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
    }

    console.log(`[NORMALIZE] ${normalized.length} valid products\n`);

    // Stage 3: Deduplicate
    const deduped = deduplicate(normalized);
    console.log();

    // Stage 4: Insert into database
    const insert = db.prepare(
      `INSERT OR REPLACE INTO products
      (id, barcode, product_name, brand, category, quantity, image_url, classification_confidence, weight_version, created_at, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const batch = db.transaction((products: Product[]) => {
      for (const p of products) {
        insert.run(
          p.id,
          p.barcode,
          p.product_name,
          p.brand,
          p.category,
          p.quantity,
          p.image_url,
          p.classification_confidence,
          p.weight_version,
          p.created_at,
          p.last_updated
        );
      }
    });

    batch(deduped);
    console.log(`[INSERT] Stored ${deduped.length} products to database\n`);

    // Stage 5: Reweight classifier with feedback
    reweightClassifier(db);
    console.log();

    // Stage 6: Export versioned dataset
    const version = await exportDataset(db, "./exports");
    console.log(`\n[ENGINE] ✓ Data product version ${version.version} ready`);

  } catch (err) {
    console.error("[ENGINE] Fatal error:", err);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run if main
runDataEngine();