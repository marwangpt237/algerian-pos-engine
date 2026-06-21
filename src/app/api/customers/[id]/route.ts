import { NextResponse } from 'next/server';
import pool, { initSchema } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initSchema();
    
    const client = await pool.connect();
    
    try {
      await client.query('DELETE FROM customers WHERE id = $1', [params.id]);

      return NextResponse.json({
        success: true,
        data: { message: 'Customer deleted' }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}