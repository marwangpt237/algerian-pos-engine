import { NextResponse } from 'next/server';
import pool, { initSchema } from '@/lib/db';

export async function GET() {
  try {
    // Initialize schema on first request
    await initSchema();
    
    const client = await pool.connect();
    
    try {
      // Get product stats
      const productStats = await client.query(`
        SELECT 
          COUNT(*) as total_products,
          AVG(classification_confidence) as avg_confidence
        FROM products
      `);

      // Get customer count
      const customerCount = await client.query('SELECT COUNT(*) as count FROM customers');

      // Get pending feedback count
      const pendingFeedback = await client.query('SELECT COUNT(*) as count FROM feedback WHERE applied = 0');

      // Get category distribution
      const categoryRows = await client.query(`
        SELECT category, COUNT(*) as count 
        FROM products 
        GROUP BY category 
        ORDER BY count DESC
      `);

      const category_distribution: Record<string, number> = {};
      for (const row of categoryRows.rows) {
        category_distribution[row.category] = parseInt(row.count);
      }

      // Get recent feedback
      const recentFeedback = await client.query(`
        SELECT id, barcode, predicted_category, correct_category, trust_score, created_at
        FROM feedback 
        ORDER BY created_at DESC 
        LIMIT 10
      `);

      // Get last export
      const lastExport = await client.query(`
        SELECT version, product_count, avg_confidence, exported_at
        FROM dataset_versions 
        ORDER BY exported_at DESC 
        LIMIT 1
      `);

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            total_products: productStats.rows[0]?.total_products || 0,
            avg_confidence: productStats.rows[0]?.avg_confidence || 0,
            total_customers: customerCount.rows[0]?.count || 0,
            pending_feedback: pendingFeedback.rows[0]?.count || 0
          },
          category_distribution,
          recent_feedback: recentFeedback.rows,
          last_export: lastExport.rows[0] || undefined
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}