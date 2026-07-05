/**
 * API: List posts (admin)
 * GET /api/admin/posts?status=&limit=&offset=
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const where = status && status !== 'all' ? { status } : {};
  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        focusKeyword: true,
        wordCount: true,
        readingTime: true,
        coverImage: true,
        status: true,
        publishedAt: true,
      },
    }),
    db.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, limit, offset });
}
