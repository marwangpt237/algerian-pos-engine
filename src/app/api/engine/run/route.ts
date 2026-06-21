import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool, { initSchema } from '@/lib/db';
import { TAXONOMY } from '@/types';
import { fetchProducts } from '@/stages/fetch';
import { cleanBrand, normalizeQuantity } from '@/stages/normalize';

// Simple classifier for API
function classifyProduct(productName: string, brand: string): { category: string; confidence: number } {
  const text = `${productName} ${brand}`.toLowerCase();
  
  const KEYWORDS: Record<string, string[]> = {
    "Eau": ["eau", "water", "mineral", "spring"],
    "Lait": ["lait", "milk", "poudre de lait"],
    "Yaourt": ["yaourt", "yogurt"],
    "Fromage": ["fromage", "cheese"],
    "Beurre": ["beurre", "butter"],
    "Huile": ["huile", "oil", "tournesol", "olive"],
    "Sucre": ["sucre", "sugar"],
    "Farine": ["farine", "flour"],
    "Riz": ["riz", "rice"],
    "Semoule": ["semoule", "couscous"],
    "Pâtes": ["pâte", "pâtes", "pasta", "spaghetti"],
    "Biscuit": ["biscuit", "cookie"],
    "Chocolat": ["chocolat", "cacao"],
    "Café": ["café", "coffee"],
    "Thé": ["thé", "tea"],
    "Jus": ["jus", "juice"],
    "Boisson Gazeuse": ["coca", "cola", "soda", "sprite", "fanta"],
    "Sauce": ["harissa", "sauce", "tomate"],
    "Conserve": ["tomate", "concentré", "conserve"],
    "Confiture": ["confiture", "jam"],
    "Miel": ["miel", "honey"],
    "Snack": ["chips", "snack"],
    "Détergent": ["lessive", "detergent"],
    "Vaisselle": ["vaisselle"],
    "Hygiène": ["savon", "gel douche"],
    "Shampooing": ["shampooing"],
    "Dentifrice": ["dentifrice", "toothpaste"],
  };

  let bestCategory = "Autre";
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return {
    category: bestCategory,
    confidence: Math.min(maxScore / 3, 1.0)
  };
}

export async function POST() {
  try {
    console.log('[ENGINE] Starting data product engine...\n');

    await initSchema();
    const client = await pool.connect();

    try {
      // Stage 1: Fetch
      const raw = await fetchProducts();
      console.log(`[FETCH] Retrieved ${raw.length} raw products`);

      // Stage 2: Normalize & Classify
      const normalized: any[] = [];

      for (const p of raw) {
        if (!p.code || p.code.length < 8) continue;

        const name = (p.product_name_fr || p.product_name || "").trim();
        if (!name || name.length <= 2 || /^\d+$/.test(name)) continue;

        const result = classifyProduct(name, p.brands || "");

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

      console.log(`[NORMALIZE] ${normalized.length} valid products`);

      // Stage 3: Deduplicate (by barcode)
      const byBarcode = new Map<string, any>();
      for (const p of normalized) {
        const existing = byBarcode.get(p.barcode);
        if (!existing) {
          byBarcode.set(p.barcode, p);
        } else {
          if ((p.image_url ? 1 : 0) + p.classification_confidence >
              (existing.image_url ? 1 : 0) + existing.classification_confidence) {
            byBarcode.set(p.barcode, p);
          }
        }
      }
      const deduped = Array.from(byBarcode.values());
      console.log(`[DEDUPLICATE] ${normalized.length} → ${deduped.length}`);

      // Stage 4: Insert into database
      for (const p of deduped) {
        await client.query(`
          INSERT INTO products (id, barcode, product_name, brand, category, quantity, image_url, classification_confidence, weight_version, created_at, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (barcode) DO UPDATE SET
            product_name = EXCLUDED.product_name,
            brand = EXCLUDED.brand,
            category = EXCLUDED.category,
            quantity = EXCLUDED.quantity,
            image_url = EXCLUDED.image_url,
            classification_confidence = EXCLUDED.classification_confidence,
            last_updated = EXCLUDED.last_updated
        `, [
          p.id, p.barcode, p.product_name, p.brand, p.category,
          p.quantity, p.image_url, p.classification_confidence,
          p.weight_version, p.created_at, p.last_updated
        ]);
      }
      console.log(`[INSERT] Stored ${deduped.length} products to database`);

      // Stage 5: Reweight (apply unapplied feedback)
      const feedbackRows = await client.query('SELECT * FROM feedback WHERE applied = 0');
      
      if (feedbackRows.rows.length > 0) {
        const weightsResult = await client.query('SELECT weights FROM classifier_state ORDER BY updated_at DESC LIMIT 1');
        let weights: Record<string, number> = weightsResult.rows[0] ? JSON.parse(weightsResult.rows[0].weights) : {};
        
        for (const cat of TAXONOMY) {
          if (!weights[cat]) weights[cat] = 1.0;
        }

        for (const fb of feedbackRows.rows) {
          const signal = fb.trust_score * 0.05;
          weights[fb.correct_category] = Math.min(weights[fb.correct_category] + signal, 10);
          weights[fb.predicted_category] = Math.max(weights[fb.predicted_category] - signal * 0.5, 0.1);
          
          await client.query('UPDATE feedback SET applied = 1 WHERE id = $1', [fb.id]);
        }

        await client.query('INSERT INTO classifier_state (id, weights, updated_at) VALUES ($1, $2, $3)',
          [crypto.randomUUID(), JSON.stringify(weights), new Date().toISOString()]);
        
        console.log(`[REWEIGHT] Applied ${feedbackRows.rows.length} corrections`);
      }

      // Stage 6: Record export version
      const version = new Date().toISOString().replace(/[:-]/g, "").slice(0, 12);
      const avgConfidence = deduped.reduce((sum, p) => sum + p.classification_confidence, 0) / deduped.length;

      await client.query('INSERT INTO dataset_versions (version, product_count, avg_confidence, exported_at) VALUES ($1, $2, $3, $4)',
        [version, deduped.length, avgConfidence, new Date().toISOString()]);

      console.log(`\n[ENGINE] ✓ Data product version ${version} ready`);

      return NextResponse.json({
        success: true,
        data: {
          message: `Successfully processed ${deduped.length} products`,
          version,
          product_count: deduped.length,
          avg_confidence: avgConfidence
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('[ENGINE] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}