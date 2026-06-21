import Database from "better-sqlite3";
import { TAXONOMY, Category } from "../types";

export interface ReweightConfig {
  learning_rate: number; // Capped at 0.05
  decay_days: number; // Corrections older than this decay by 0.95
  max_weight: number; // No weight exceeds 10
  min_weight: number; // No weight drops below 0.1
}

const DEFAULT_CONFIG: ReweightConfig = {
  learning_rate: 0.05,
  decay_days: 30,
  max_weight: 10,
  min_weight: 0.1
};

export function reweightClassifier(
  db: Database.Database,
  config: ReweightConfig = DEFAULT_CONFIG
): void {
  console.log("[REWEIGHT] Starting bounded reweight cycle...");

  // Get all unapplied feedback
  const feedbackRows = db
    .prepare("SELECT * FROM feedback WHERE applied = 0 ORDER BY created_at ASC")
    .all() as any[];

  if (feedbackRows.length === 0) {
    console.log("[REWEIGHT] No feedback to process");
    return;
  }

  // Load current weights
  const weightsRaw = db
    .prepare("SELECT weights FROM classifier_state ORDER BY updated_at DESC LIMIT 1")
    .get() as any;

  let weights: Record<string, number> = weightsRaw ? JSON.parse(weightsRaw.weights) : {};

  // Initialize missing categories
  for (const cat of TAXONOMY) {
    if (!weights[cat]) {
      weights[cat] = 1.0;
    }
  }

  // Process each feedback with trust weighting
  for (const fb of feedbackRows) {
    const customer = db
      .prepare("SELECT trust_score FROM customers WHERE id = ?")
      .get(fb.customer_id) as any;

    const trustScore = customer?.trust_score || 0.2; // Default: unverified
    const signal = trustScore * config.learning_rate; // Capped signal

    // Increase weight for correct category
    weights[fb.correct_category] = Math.min(
      weights[fb.correct_category] + signal,
      config.max_weight
    );

    // Decrease weight for incorrect category
    weights[fb.predicted_category] = Math.max(
      weights[fb.predicted_category] - signal * 0.5,
      config.min_weight
    );

    // Mark as applied
    db.prepare("UPDATE feedback SET applied = 1 WHERE id = ?").run(fb.id);
  }

  // Apply decay: older corrections matter less
  const decayMultiplier = 0.95;
  const cutoffDate = new Date(Date.now() - config.decay_days * 24 * 60 * 60 * 1000);

  const oldFeedback = db
    .prepare("SELECT * FROM feedback WHERE created_at < ? AND applied = 1")
    .all(cutoffDate.toISOString()) as any[];

  for (const fb of oldFeedback) {
    weights[fb.correct_category] *= decayMultiplier;
    weights[fb.predicted_category] *= (1 + decayMultiplier) / 2;
  }

  // Ensure bounds
  for (const cat of TAXONOMY) {
    weights[cat] = Math.max(config.min_weight, Math.min(config.max_weight, weights[cat]));
  }

  // Save updated weights
  db.prepare(
    "INSERT INTO classifier_state (id, weights, updated_at) VALUES (?, ?, ?)"
  ).run(
    crypto.randomUUID(),
    JSON.stringify(weights),
    new Date().toISOString()
  );

  console.log(`[REWEIGHT] Applied ${feedbackRows.length} corrections with trust weighting`);
}