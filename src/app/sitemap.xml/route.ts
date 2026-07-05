/**
 * Dynamic sitemap: /sitemap.xml
 */
import { db } from '@/lib/db';
import { SITE, CATEGORIES } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const [posts, categories] = await Promise.all([
    db.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, updatedAt: true, category: true },
    }),
    db.keyword.groupBy({ by: ['category'], _count: true }),
  ]);

  const urls: string[] = [];
  urls.push(`  <url><loc>${SITE.url}/</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`);
  urls.push(`  <url><loc>${SITE.url}/about-keevan-store</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);

  for (const c of CATEGORIES) {
    urls.push(`  <url><loc>${SITE.url}/category/${c.slug}</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`);
  }

  for (const p of posts) {
    urls.push(`  <url><loc>${SITE.url}/post/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
