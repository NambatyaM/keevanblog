/**
 * Post detail page: /post/[slug]
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { SITE, CATEGORIES } from '@/lib/site-config';
import { ArrowLeft, Calendar, Clock, Tag, Store } from 'lucide-react';
import { PostCTA } from '@/components/PostCTA';
import { PostShare } from '@/components/PostShare';
import { RelatedPosts } from '@/components/RelatedPosts';
import { AdsterraAd } from '@/components/AdsterraAd';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) return { title: 'Post not found' };
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `${SITE.url}/post/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `${SITE.url}/post/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.coverAlt || post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post || post.status !== 'published') notFound();

  const category = CATEGORIES.find((c) => c.slug === post.category);
  const related = await db.post.findMany({
    where: { status: 'published', category: post.category, NOT: { id: post.id } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      coverAlt: true,
      readingTime: true,
      publishedAt: true,
    },
  });

  const articleHtml = post.content;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImage ? [post.coverImage] : undefined,
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/post/${post.slug}` },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: category?.name || post.category, item: `${SITE.url}/category/${post.category}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE.url}/post/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Header />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href={`/category/${post.category}`} className="hover:text-foreground">
              {category?.name || post.category}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{post.title}</span>
          </nav>

          <Link
            href={`/category/${post.category}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
            style={{ color: category?.color || '#00854a', backgroundColor: `${category?.color || '#00854a'}15` }}
          >
            {category?.name || post.category}
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime} min read
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              {post.wordCount.toLocaleString()} words
            </div>
          </div>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.coverAlt || post.title}
              className="w-full aspect-[1200/630] object-cover rounded-xl mb-8"
              width={1200}
              height={630}
              loading="eager"
            />
          )}

          <details className="mb-8 rounded-lg border bg-muted/30 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
              Table of Contents
            </summary>
            <nav className="mt-3 space-y-1 text-sm">
              {articleHtml.match(/<h2[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h2>/g)?.map((h) => {
                const id = h.match(/id="([^"]*)"/)?.[1] || '';
                const text = h.replace(/<[^>]*>/g, '');
                return (
                  <a key={id} href={`#${id}`} className="block text-muted-foreground hover:text-primary">
                    {text}
                  </a>
                );
              })}
            </nav>
          </details>

          <div
            className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-foreground prose-h2:border-b prose-h2:pb-2
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-foreground
              prose-p:leading-relaxed prose-p:text-foreground/90
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-li:text-foreground/90
              prose-blockquote:border-l-[4px] prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-hr:my-8 prose-hr:border-border
              prose-ol:list-decimal prose-ul:list-disc"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />

          {/* Adsterra native ad — mid-article (after body, before tags) */}
          <AdsterraAd className="my-10" />

          {post.tags && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t">
              {post.tags.split(',').filter(Boolean).map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          <PostShare slug={post.slug} title={post.title} />

          <PostCTA />
        </article>

        <RelatedPosts posts={related} />
      </main>

      <Footer />
    </div>
  );
}
