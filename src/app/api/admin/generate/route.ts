/**
 * API: Trigger immediate post generation.
 * POST /api/admin/generate
 * Body: { keyword?: string, category?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateAndStorePost, pickNextKeyword } from '@/lib/ai-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
