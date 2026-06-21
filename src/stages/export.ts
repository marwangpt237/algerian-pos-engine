import fs from "fs";
import Database from "better-sqlite3";
import { createObjectCsvWriter } from "csv-writer";
import { Product, DatasetVersion, TAXONOMY } from "../types";

export async function exportDataset(
  db: Database.Database,
  outputDir: string
): Promise<DatasetVersion> {
  const timestamp = new Date().toISOString().replace(/[:-]/g, "").slice(0, 12);
  const version = timestamp;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const products = db
    .prepare("SELECT * FROM products ORDER BY barcode")
    .all() as Product[];

  const avgConfidence =
    products.reduce((sum, p) => sum + p.classification_confidence, 0) / products.length;

  // JSON export
  fs.writeFileSync(
    `${outputDir}/algerian-pos-${version}.json`,
    JSON.stringify(
      {
        version,
        exported_at: new Date().toISOString(),
        product_count: products.length,
        avg_confidence: avgConfidence.toFixed(3),
        taxonomy: TAXONOMY,
        products
      },
      null,
      2
    )
  );

  // CSV export
  const csvWriter = createObjectCsvWriter({
    path: `${outputDir}/algerian-pos-${version}.csv`,
    header: [
      { id: "barcode", title: "Barcode" },
      { id: "product_name", title: "Product Name" },
      { id: "brand", title: "Brand" },
      { id: "category", title: "Category" },
      { id: "quantity", title: "Quantity" },
      { id: "classification_confidence", title: "Confidence" }
    ]
  });

  await csvWriter.writeRecords(products);

  // SQLite snapshot
  const snapshotDb = new Database(`${outputDir}/algerian-pos-${version}.db`);
  snapshotDb.exec(`
    CREATE TABLE products (
      barcode TEXT PRIMARY KEY,
      product_name TEXT,
      brand TEXT,
      category TEXT,
      quantity TEXT,
      classification_confidence REAL,
      image_url TEXT
    );
    CREATE INDEX idx_category ON products(category);
  `);

  const insert = snapshotDb.prepare(
    "INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  for (const p of products) {
    insert.run(
      p.barcode,
      p.product_name,
      p.brand,
      p.category,
      p.quantity,
      p.classification_confidence,
      p.image_url
    );
  }

  snapshotDb.close();

  // Changelog
  const changelog = [
    `Exported: ${products.length} products`,
    `Average confidence: ${avgConfidence.toFixed(1)}%`,
    `Taxonomy: ${TAXONOMY.length} categories`,
    `Generated: ${new Date().toISOString()}`
  ];

  console.log(`[EXPORT] Generated version ${version}`);

  return {
    version,
    product_count: products.length,
    avg_confidence: avgConfidence,
    changelog,
    exported_at: new Date().toISOString()
  };
}