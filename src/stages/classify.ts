import Database from "better-sqlite3";
import { Category, TAXONOMY } from "../types";
import { KEYWORDS } from "./fetch";

export interface ClassificationResult {
  category: Category;
  confidence: number;
  scores: Partial<Record<Category, number>>;
}

export function createClassifier(db: Database.Database) {
  return {
    classify(productName: string, brand: string): ClassificationResult {
      const text = `${productName} ${brand}`.toLowerCase();
      
      // Load weights from database
      const weightsRaw = db
        .prepare("SELECT weights FROM classifier_state ORDER BY updated_at DESC LIMIT 1")
        .get() as any;
      
      const weights = weightsRaw ? JSON.parse(weightsRaw.weights) : {};
      
      const scores: Partial<Record<Category, number>> = {};
      
      for (const category of TAXONOMY) {
        let score = 0;
        
        // Keyword matching
        const keywords = KEYWORDS[category as Category] || [];
        for (const kw of keywords) {
          if (text.includes(kw.toLowerCase())) {
            score += 1;
          }
        }
        
        // Apply learned weights
        if (weights[category]) {
          score *= (weights[category] || 1.0);
        }
        
        scores[category as Category] = score;
      }
      
      // Find best match
      const entries = Object.entries(scores).filter(([, v]) => v !== undefined) as [Category, number][];
      const bestEntry = entries.sort(([,a], [,b]) => b - a)[0];
      const bestCategory = bestEntry ? bestEntry[0] : "Autre";
      const maxScore = Math.max(...entries.map(([, v]) => v), 1);
      const confidence = Math.min(maxScore / 3, 1.0);
      
      return {
        category: bestCategory,
        confidence,
        scores
      };
    }
  };
}