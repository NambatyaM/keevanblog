/**
 * API: Seed the keyword bank into DB
 * POST /api/admin/seed
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SEED_KEYWORDS } from '@/lib/seed-keywords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  let inserted = 0;
  let skipped = 0;
  for (const sk of SEED_KEYWORDS) {
    try {
      await db.keyword.upsert({
        where: { keyword: sk.keyword },
        create: {
          keyword: sk.keyword,
          category: sk.category,
          difficulty: sk.difficulty,
          searchVolume: sk.estVolume,
        },
        update: {},
      });
      inserted++;
    } catch {
      skipped++;
    }
  }
  return NextResponse.json({ success: true, inserted, skipped, total: SEED_KEYWORDS.length });
}
