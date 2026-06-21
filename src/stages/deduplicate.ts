import { Product } from "../types";

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array(a.length + 1)
    .fill(0)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[a.length][b.length];
}

export function deduplicate(products: Product[], threshold: number = 0.85): Product[] {
  const byBarcode = new Map<string, Product>();

  // Primary: barcode
  for (const p of products) {
    const existing = byBarcode.get(p.barcode);
    if (!existing) {
      byBarcode.set(p.barcode, p);
    } else {
      // Keep better quality version
      if ((p.image_url ? 1 : 0) + (p.classification_confidence) >
          (existing.image_url ? 1 : 0) + (existing.classification_confidence)) {
        byBarcode.set(p.barcode, p);
      }
    }
  }

  const deduped = Array.from(byBarcode.values());
  const fuzzyDeduped: Product[] = [];
  const seen = new Set<string>();

  // Secondary: fuzzy match
  for (const p of deduped) {
    const sig = `${p.product_name}|${p.brand}`.toLowerCase();
    let isDup = false;

    for (const existing of seen) {
      const dist = levenshtein(sig, existing);
      const maxLen = Math.max(sig.length, existing.length);
      const sim = 1 - dist / maxLen;
      if (sim > threshold) {
        isDup = true;
        break;
      }
    }

    if (!isDup) {
      seen.add(sig);
      fuzzyDeduped.push(p);
    }
  }

  console.log(`[DEDUPLICATE] ${products.length} → ${fuzzyDeduped.length}`);
  return fuzzyDeduped;
}