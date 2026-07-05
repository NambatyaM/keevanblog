'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site-config';
import { Mail, Sparkles } from 'lucide-react';

export function NewsletterCTA() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="border-t bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${SITE.themeColor}15` }}
        >
          <Mail className="w-6 h-6" style={{ color: SITE.themeColor }} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Get one actionable tip every week
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Join 2,000+ East African creators getting our newsletter on selling digital products.
          No spam. Unsubscribe anytime.
        </p>
        <form
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          onSubmit={subscribe}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
            style={{ backgroundColor: SITE.themeColor }}
          >
            <Sparkles className="w-4 h-4" /> {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && (
          <p className="text-xs text-green-600 mt-3">Subscribed. Check your inbox.</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-600 mt-3">Something went wrong. Try again.</p>
        )}
      </div>
    </section>
  );
}
