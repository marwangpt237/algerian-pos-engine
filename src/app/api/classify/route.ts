import { NextResponse } from 'next/server';
import pool, { initSchema } from '@/lib/db';
import { TAXONOMY, Category } from '@/types';
import { KEYWORDS } from '@/stages/fetch';

function classifyProduct(productName: string, brand: string, weights: Record<string, number> = {}) {
  const text = `${productName} ${brand}`.toLowerCase();
  
  const scores: Record<string, number> = {};
  
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
    
    scores[category] = score;
  }
  
  // Find best match
  const entries = Object.entries(scores).filter(([, v]) => v > 0);
  const bestEntry = entries.sort(([,a], [,b]) => b - a)[0];
  const bestCategory = bestEntry ? bestEntry[0] : 'Autre';
  const maxScore = Math.max(...entries.map(([, v]) => v), 1);
  const confidence = Math.min(maxScore / 3, 1.0);
  
  return {
    category: bestCategory,
    confidence,
    scores
  };
}

export async function POST(request: Request) {
  try {
    await initSchema();
    
    const body = await request.json();
    const { productName, brand } = body;

    if (!productName) {
      return NextResponse.json({
        success: false,
        error: 'Product name is required'
      });
    }

    let weights = {};
    
    try {
      const client = await pool.connect();
      try {
        const weightsResult = await client.query('SELECT weights FROM classifier_state ORDER BY updated_at DESC LIMIT 1');
        if (weightsResult.rows[0]) {
          weights = JSON.parse(weightsResult.rows[0].weights);
        }
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.log('No existing weights, using defaults');
    }

    const result = classifyProduct(productName, brand || '', weights);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Classify API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}