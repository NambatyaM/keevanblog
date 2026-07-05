/**
 * Category listing page: /category/[slug]
 */
import Link from 'next/link';
import { db } from '@/lib/db';
import { SITE, CATEGORIES } from '@/lib/site-config';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PostCard } from '@/components/PostCard';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { PostCTA } from '@/components/PostCTA';
import { AdsterraAd } from '@/components/AdsterraAd';
import { ArrowRight } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: 'Category not found' };
  return {
    title: `${cat.name} — ${SITE.name}`,
    description: cat.description,
    alternates: { canonical: `${SITE.url}/category/${cat.slug}` },
    openGraph: {
      title: `${cat.name} — ${SITE.name}`,
      description: cat.description,
      url: `${SITE.url}/category/${cat.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Category not found</h1>
            <Link href="/" className="text-primary underline">Back to home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const posts = await db.post.findMany({
    where: { status: 'published', category: slug },
    orderBy: { publishedAt: 'desc' },
    take: 24,
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
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground">{cat.name}</span>
            </nav>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
              style={{ color: cat.color, backgroundColor: `${cat.color}15` }}
            >
              {cat.name}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
              {cat.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{cat.description}</p>
            <div className="mt-4 text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
            </div>
          </div>
        </section>

        {/* Posts grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No articles in this category yet. Check back soon — new posts are published daily.</p>
              <a
                href={SITE.links.signUp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                Start your free Keevan Store <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
              {/* Adsterra native ad after post grid */}
              <AdsterraAd className="mt-10" />
            </>
          )}
        </section>

        <PostCTA />
        <WhatsAppCTA />
      </main>
      <Footer />
    </div>
  );
}
