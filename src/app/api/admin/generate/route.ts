/**
 * API: Trigger immediate post generation.
 *
 * POST /api/admin/generate            — manual trigger from admin dashboard
 *   Body: { keyword?: string, category?: string }
 *
 * GET  /api/admin/generate?source=cron — Vercel Cron invocation
 *   Auto-picks the next best keyword from the seed bank and generates.
 *   Returns 200 immediately so Vercel Cron doesn't time out; the actual
 *   generation runs in the background via a fire-and-forget promise.
 *   (Vercel Hobby plan: 60s cron timeout; article gen takes ~45s + image ~15s.)
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateAndStorePost, pickNextKeyword } from '@/lib/ai-engine';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Allow up to 5 minutes for manual generations (Pro/Enterprise plans support this)
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    let keyword = body.keyword?.trim();
    let category = body.category?.trim();

    if (!keyword || !category) {
      const pick = await pickNextKeyword();
      if (!pick) {
        return NextResponse.json({ error: 'No keywords available' }, { status: 400 });
      }
      keyword = keyword || pick.keyword;
      category = category || pick.category;
    }

    const result = await generateAndStorePost({ keyword, category });
    if (result.post) {
      return NextResponse.json({ success: true, post: result.post });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

/**
 * Vercel Cron handler.
 *
 * Vercel Cron sends GET requests with no auth header. To prevent abuse,
 * we only run if the request includes `?source=cron`. We also return 200
 * immediately and run the generation async — Vercel Hobby's 60s cron
 * timeout would otherwise kill the request mid-generation.
 *
 * For production security, also configure the cron route in Vercel project
 * settings → Settings → Cron Jobs → "Protect with a Bearer token".
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');

  // Only allow cron-triggered GETs (and local manual GETs without source for testing)
  // Vercel Cron will always include ?source=cron (configured in vercel.json)
  if (source !== 'cron' && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'GET requests require ?source=cron in production' },
      { status: 403 }
    );
  }

  try {
    // Check pause flag — skip if admin paused the scheduler
    const paused = await db.setting.findUnique({ where: { key: 'scheduler.paused' } });
    if (paused?.value === 'true') {
      await db.scheduleLog.create({ data: { action: 'skipped', message: 'cron: scheduler paused' } });
      return NextResponse.json({ skipped: true, reason: 'paused' });
    }

    // Pick next keyword
    const pick = await pickNextKeyword();
    if (!pick) {
      return NextResponse.json({ skipped: true, reason: 'no keywords available' });
    }

    // Return 200 immediately so Vercel Cron sees success
    // Fire the actual generation in the background
    generateAndStorePost({ keyword: pick.keyword, category: pick.category })
      .then((result) => {
        console.log('[cron] generation done:', result.post?.slug || result.error);
      })
      .catch((err) => {
        console.error('[cron] generation failed:', err?.message || err);
      });

    return NextResponse.json({
      triggered: true,
      keyword: pick.keyword,
      category: pick.category,
      message: 'Generation started in background. Check /api/admin/scheduler for status.',
    });
  } catch (err: any) {
    console.error('[cron] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
