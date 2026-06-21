import { NextResponse } from 'next/server';
import pool, { initSchema } from '@/lib/db';
import crypto from 'crypto';

const TRUST_SCORES = {
  chain: 1.0,
  pharmacy: 0.7,
  shop: 0.5,
  unknown: 0.2
};

export async function GET() {
  try {
    await initSchema();
    
    const client = await pool.connect();
    
    try {
      const customers = await client.query('SELECT * FROM customers ORDER BY created_at DESC');

      return NextResponse.json({
        success: true,
        data: customers.rows
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Customers API error:', error);
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
    const { name, email, type } = body;

    if (!name || !email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const customer = {
      id: crypto.randomUUID(),
      name,
      email,
      type: type || 'unknown',
      trust_score: TRUST_SCORES[type as keyof typeof TRUST_SCORES] || 0.2,
      created_at: new Date().toISOString()
    };

    const client = await pool.connect();
    
    try {
      await client.query(`
        INSERT INTO customers (id, name, email, type, trust_score, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [customer.id, customer.name, customer.email, customer.type, customer.trust_score, customer.created_at]);

      return NextResponse.json({
        success: true,
        data: customer
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Customer POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}