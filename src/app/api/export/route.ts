import { NextResponse } from 'next/server';
import pool, { initSchema } from '@/lib/db';

export async function GET() {
  try {
    await initSchema();
    
    const client = await pool.connect();
    
    try {
      const versions = await client.query('SELECT * FROM dataset_versions ORDER BY exported_at DESC');

      return NextResponse.json({
        success: true,
        data: versions.rows
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Export GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}

export async function POST() {
  try {
    await initSchema();
    
    const client = await pool.connect();
    
    try {
      const products = await client.query('SELECT * FROM products ORDER BY barcode');
      const avgConfidence = products.rows.reduce((sum: number, p: any) => sum + p.classification_confidence, 0) / products.rows.length;

      const version = new Date().toISOString().replace(/[:-]/g, "").slice(0, 12);

      // Record version
      await client.query('INSERT INTO dataset_versions (version, product_count, avg_confidence, exported_at) VALUES ($1, $2, $3, $4)',
        [version, products.rows.length, avgConfidence, new Date().toISOString()]);

      return NextResponse.json({
        success: true,
        data: {
          message: `Exported ${products.rows.length} products`,
          version,
          product_count: products.rows.length
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Export POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}