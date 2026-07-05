/**
 * RSS feed: /feed
 */
import { db } from '@/lib/db';
import { SITE } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await db.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
      coverImage: true,
    },
  });

  const items = posts
    .map(
      (p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${SITE.url}/post/${p.slug}</link>
      <guid isPermaLink="true">${SITE.url}/post/${p.slug}</guid>
      <description>${xmlEscape(p.excerpt)}</description>
      <category>${xmlEscape(p.category)}</category>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${xmlEscape(SITE.description)}</description>
    <language>${SITE.lang}</language>
    <atom:link href="${SITE.url}/feed" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
