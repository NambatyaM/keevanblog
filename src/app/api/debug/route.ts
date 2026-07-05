import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  return NextResponse.json({
    DATABASE_URL_set: !!dbUrl,
    DATABASE_URL_prefix: dbUrl ? dbUrl.split('://')[0] : null,
    DATABASE_URL_length: dbUrl ? dbUrl.length : 0,
    TURSO_AUTH_TOKEN_set: !!process.env.TURSO_AUTH_TOKEN,
    ZAI_API_KEY_set: !!process.env.ZAI_API_KEY,
    ZAI_MODEL: process.env.ZAI_MODEL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
