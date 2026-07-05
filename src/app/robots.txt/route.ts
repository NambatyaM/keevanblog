/**
 * robots.txt
 */
import { SITE } from '@/lib/site-config';

export const runtime = 'nodejs';

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/admin/

Sitemap: ${SITE.url}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
