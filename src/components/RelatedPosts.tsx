import Link from 'next/link';
import { PostCard } from '@/components/PostCard';

type RelatedPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  coverAlt?: string | null;
  readingTime: number;
  publishedAt: Date;
};

export function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  if (!posts || posts.length === 0) return null;
  return (
    <section className="border-t bg-muted/30 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Related articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <PostCard key={p.slug} post={{ ...p, category: 'related' }} />
          ))}
        </div>
      </div>
    </section>
  );
}
