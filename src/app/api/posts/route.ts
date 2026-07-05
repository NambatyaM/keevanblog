/**
 * API: Public post list (for infinite scroll / category pages)
 * GET /api/posts?category=&limit=&offset=
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const where = {
    status: 'published' as const,
    ...(category ? { category } : {}),
  };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        coverImage: true,
        coverAlt: true,
        readingTime: true,
        wordCount: true,
        publishedAt: true,
        focusKeyword: true,
      },
    }),
    db.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, limit, offset });
}
