/**
 * Home page: / (the only user-visible route per fullstack-dev rules)
 *
 * Combines:
 *  - Hero with lead-gen CTA
 *  - Latest published posts grid
 *  - Category showcase
 *  - Featured marketing section promoting keevanstore.in
 *  - WhatsApp group invite
 *  - Adsterra native ad unit
 *  - Floating "Admin" button to open the AdminDashboard modal
 */
import Link from 'next/link';
import { db } from '@/lib/db';
import { SITE, CATEGORIES } from '@/lib/site-config';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PostCard } from '@/components/PostCard';
import { PostCTA } from '@/components/PostCTA';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { AdsterraAd } from '@/components/AdsterraAd';
import { HomeAdminTrigger } from '@/components/HomeAdminTrigger';
import { ArrowRight, Sparkles, TrendingUp, Store, Globe2, Wallet } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: SITE.url },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export default async function Home() {
  // Fetch latest posts + per-category counts in parallel
  const [latestPosts, categoryCounts] = await Promise.all([
    db.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 9,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        coverAlt: true,
        category: true,
        readingTime: true,
        publishedAt: true,
      },
    }),
    db.post.groupBy({
      by: ['category'],
      _count: true,
      where: { status: 'published' },
    }),
  ]);

  const countMap = new Map(categoryCounts.map((c) => [c.category, c._count]));

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { '@type': 'Organization', name: 'Keevan Store', url: SITE.mainSiteUrl },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      <Header />
      <HomeAdminTrigger />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden border-b"
          style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #ffffff 100%)' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="max-w-3xl">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5"
                style={{ backgroundColor: `${SITE.themeColor}15`, color: SITE.themeColor }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Updated daily with fresh guides
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
                Sell digital products in East Africa. <span style={{ color: SITE.themeColor }}>Keep 90%.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-7 leading-relaxed">
                Actionable guides on selling e-books, PDFs, templates, and digital downloads across Uganda,
                Kenya, Tanzania, and Rwanda. Built for creators who want to earn from their knowledge —
                powered by{' '}
                <a href={SITE.mainSiteUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline underline-offset-4 hover:opacity-80">
                  keevanstore.in
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={SITE.links.signUp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition"
                  style={{ backgroundColor: SITE.themeColor }}
                >
                  <Store className="w-4 h-4" /> Start Selling Free
                </a>
                <a
                  href="#latest"
                  className="inline-flex items-center gap-2 bg-background border font-semibold px-6 py-3 rounded-lg hover:bg-muted/50 transition"
                >
                  Read the blog <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              {/* Quick stats */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Wallet, label: 'Creator payout', value: '90%' },
                  { icon: Globe2, label: 'Countries', value: '4' },
                  { icon: TrendingUp, label: 'New posts', value: 'Daily' },
                  { icon: Store, label: 'Monthly fee', value: 'UGX 0' },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="bg-background/80 backdrop-blur border rounded-lg p-3">
                      <Icon className="w-4 h-4 mb-1" style={{ color: SITE.themeColor }} />
                      <div className="text-xl font-bold">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Latest posts */}
        <section id="latest" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Latest articles</h2>
              <p className="text-muted-foreground mt-1">Fresh guides on selling digital products in East Africa.</p>
            </div>
            <Link href="/category/start-selling" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-muted/30">
              <p className="text-muted-foreground mb-3">No articles yet — the auto-blog is warming up.</p>
              <p className="text-xs text-muted-foreground">Click the <strong>Admin</strong> button in the bottom-right to generate the first post.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </section>

        {/* Adsterra native ad — between latest posts and categories */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AdsterraAd className="py-4" />
        </div>

        {/* Categories */}
        <section className="bg-muted/30 border-y py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-center">Browse by category</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Five focused tracks covering every stage of selling digital products in East Africa.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="bg-background border rounded-xl p-5 hover:shadow-md transition group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 font-bold text-white text-sm"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name[0]}
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition">{c.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{c.description}</p>
                  <span className="text-xs text-muted-foreground">{countMap.get(c.slug) || 0} articles</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured marketing block for keevanstore.in */}
        <PostCTA />

        {/* WhatsApp group invite (replaces newsletter) */}
        <WhatsAppCTA />
      </main>
      <Footer />
    </div>
  );
}
