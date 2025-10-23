import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, route: 'GET /api/test' }, { status: 200 });
}

export async function POST(request) {
  console.log('✅ Test endpoint hit');
  return NextResponse.json({ message: 'Test successful' }, { status: 200 });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
