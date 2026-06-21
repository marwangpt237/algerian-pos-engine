import { Category, TAXONOMY } from "../types";
import { KEYWORDS } from "./fetch";

export interface ClassificationResult {
  category: Category;
  confidence: number;
  scores: Partial<Record<Category, number>>;
}

interface CategoryScore {
  category: Category;
  score: number;
  matchedKeywords: string[];
}

export function classifyProduct(
  productName: string, 
  brand: string,
  categories?: string
): ClassificationResult {
  const text = `${productName} ${brand} ${categories || ''}`.toLowerCase();
  
  const scores: CategoryScore[] = [];
  
  for (const category of TAXONOMY) {
    if (category === "Autre") continue;
    
    const keywords = KEYWORDS[category as Category] || [];
    let score = 0;
    const matchedKeywords: string[] = [];
    
    for (const kw of keywords) {
      // Check for exact word match (with word boundaries)
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text)) {
        score += 1;
        matchedKeywords.push(kw);
      }
      // Also check for partial matches for short keywords
      else if (kw.length <= 4 && text.includes(kw)) {
        score += 0.5;
        matchedKeywords.push(kw);
      }
    }
    
    if (score > 0) {
      scores.push({ category: category as Category, score, matchedKeywords });
    }
  }
  
  // Sort by score and get best match
  scores.sort((a, b) => b.score - a.score);
  
  if (scores.length === 0) {
    return {
      category: "Autre",
      confidence: 0,
      scores: {}
    };
  }
  
  const best = scores[0];
  
  // Calculate confidence based on:
  // 1. Number of matched keywords (max contribution: 0.6)
  // 2. Score magnitude (max contribution: 0.3)
  // 3. Minimum baseline when matched (0.2)
  
  const keywordBonus = Math.min(best.matchedKeywords.length * 0.15, 0.6);
  const scoreBonus = Math.min(best.score / 5, 0.3);
  const baseline = 0.2;
  
  const confidence = Math.min(baseline + keywordBonus + scoreBonus, 1.0);
  
  // Build scores object for all categories
  const scoresObj: Partial<Record<Category, number>> = {};
  for (const s of scores) {
    scoresObj[s.category] = s.score;
  }
  
  return {
    category: best.category,
    confidence: Math.round(confidence * 100) / 100,
    scores: scoresObj
  };
}

export function createClassifier() {
  return {
    classify(productName: string, brand: string, categories?: string): ClassificationResult {
      return classifyProduct(productName, brand, categories);
    }
  };
}