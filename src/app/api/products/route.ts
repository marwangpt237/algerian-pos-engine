import { NextResponse } from 'next/server';
import pool, { initSchema } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initSchema();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    
    try {
      let whereClause = '1=1';
      const params: any[] = [];
      
      if (category) {
        whereClause += ' AND category = $' + (params.length + 1);
        params.push(category);
      }
      
      if (search) {
        whereClause += ' AND (product_name LIKE $' + (params.length + 1) + ' OR barcode LIKE $' + (params.length + 2) + ' OR brand LIKE $' + (params.length + 3) + ')';
        const searchPattern = '%' + search + '%';
        params.push(searchPattern, searchPattern, searchPattern);
      }

      // Get total count
      const countResult = await client.query(`SELECT COUNT(*) as total FROM products WHERE ${whereClause}`, params);
      const total = parseInt(countResult.rows[0]?.total || '0');
      const totalPages = Math.ceil(total / limit);

      // Get products
      const products = await client.query(`
        SELECT * FROM products 
        WHERE ${whereClause}
        ORDER BY last_updated DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]);

      return NextResponse.json({
        success: true,
        data: {
          products: products.rows,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}