'use client';

import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { SITE } from '@/lib/site-config';

export function PostShare({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE.url}/post/${slug}`;
  const enc = encodeURIComponent;

  const share = (href: string) => {
    if (typeof window !== 'undefined') window.open(href, '_blank', 'noopener,noreferrer');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-8 pt-6 border-t flex items-center gap-3 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Share this article:</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => share(`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`)}
          className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition"
          aria-label="Share on X"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={() => share(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`)}
          className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </button>
        <button
          onClick={() => share(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`)}
          className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </button>
        <button
          onClick={copy}
          className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition"
          aria-label="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
