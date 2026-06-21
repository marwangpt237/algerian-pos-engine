import Database from "better-sqlite3";
import { Category } from "../types";

export function recordFeedback(
  db: Database.Database,
  barcode: string,
  customerId: string,
  predicted: Category,
  correct: Category
): void {
  const customer = db
    .prepare("SELECT trust_score FROM customers WHERE id = ?")
    .get(customerId) as any;

  if (!customer) {
    console.warn(`[FEEDBACK] Customer ${customerId} not found`);
    return;
  }

  db.prepare(
    "INSERT INTO feedback (id, barcode, customer_id, predicted_category, correct_category, trust_score, applied, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    crypto.randomUUID(),
    barcode,
    customerId,
    predicted,
    correct,
    customer.trust_score,
    0,
    new Date().toISOString()
  );

  console.log(`[FEEDBACK] Recorded: ${barcode} ${predicted} → ${correct}`);
}