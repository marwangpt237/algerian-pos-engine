import { NextResponse } from 'next/server';
import pool, { initSchema } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    await initSchema();
    
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    const client = await pool.connect();
    
    try {
      let query = 'SELECT * FROM feedback ORDER BY created_at DESC';
      if (filter === 'pending') {
        query = 'SELECT * FROM feedback WHERE applied = 0 ORDER BY created_at DESC';
      } else if (filter === 'applied') {
        query = 'SELECT * FROM feedback WHERE applied = 1 ORDER BY created_at DESC';
      }

      const feedback = await client.query(query);

      return NextResponse.json({
        success: true,
        data: feedback.rows
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Feedback API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}

export async function POST(request: Request) {
  try {
    await initSchema();
    
    const body = await request.json();
    const { barcode, customer_id, predicted_category, correct_category } = body;

    if (!barcode || !customer_id || !predicted_category || !correct_category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const client = await pool.connect();
    
    try {
      // Get customer's trust score
      const customer = await client.query('SELECT trust_score FROM customers WHERE id = $1', [customer_id]);
      const trustScore = customer.rows[0]?.trust_score || 0.2;

      // Insert feedback
      await client.query(`
        INSERT INTO feedback (id, barcode, customer_id, predicted_category, correct_category, trust_score, applied, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        crypto.randomUUID(),
        barcode,
        customer_id,
        predicted_category,
        correct_category,
        trustScore,
        0,
        new Date().toISOString()
      ]);

      return NextResponse.json({
        success: true,
        data: { message: 'Feedback recorded successfully' }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}