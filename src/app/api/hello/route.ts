import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Algerian POS Engine API',
    version: '1.0.0',
    endpoints: {
      dashboard: '/api/dashboard',
      products: '/api/products',
      feedback: '/api/feedback',
      customers: '/api/customers',
      classify: '/api/classify',
      engine: '/api/engine/run',
      export: '/api/export',
      health: '/api/health'
    }
  });
}