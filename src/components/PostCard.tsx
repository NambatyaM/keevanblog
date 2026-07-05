import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { CATEGORIES } from '@/lib/site-config';

type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  coverAlt?: string | null;
  category: string;
  readingTime: number;
  publishedAt: Date;
};

export function PostCard({ post }: { post: PostCardData }) {
  const cat = CATEGORIES.find((c) => c.slug === post.category);
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group bg-background border rounded-xl overflow-hidden hover:shadow-md transition flex flex-col"
    >
      <div className="aspect-[1200/630] bg-muted relative overflow-hidden">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${cat?.color || '#00854a'} 0%, #00b564 100%)` }}
          >
            {cat?.name?.[0] || 'K'}
          </div>
        )}
        <div
          className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: cat?.color || '#00854a' }}
        >
          {cat?.name || post.category}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-primary transition line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}
