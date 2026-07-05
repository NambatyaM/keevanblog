'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SITE, NAV_LINKS, CATEGORIES } from '@/lib/site-config';
import { Store, MessageCircle, Mail } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
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
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Newsletter */}
        <div className="bg-background border rounded-xl p-6 sm:p-8 mb-10 -mt-20 relative shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Get the East African creator playbook</h3>
              <p className="text-sm text-muted-foreground">
                Weekly tips on selling e-books, PDFs, and digital products across Uganda, Kenya, Tanzania, and Rwanda.
              </p>
            </div>
            <form onSubmit={subscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: SITE.themeColor }}
              >
                {status === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
          </div>
          {status === 'success' && (
            <p className="text-xs text-green-600 mt-3">Subscribed. Check your inbox.</p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-600 mt-3">Something went wrong. Try again.</p>
          )}
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-bold mb-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: SITE.themeColor }}
              >
                <Store className="w-5 h-5" />
              </span>
              {SITE.name}
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">
              {SITE.description}
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href={`https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-2 hover:text-foreground transition"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp: {SITE.whatsapp}
              </a>
              <a
                href={`mailto:${SITE.contactEmail}`}
                className="inline-flex items-center gap-2 hover:text-foreground transition"
              >
                <Mail className="w-4 h-4" /> {SITE.contactEmail}
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Main site */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Keevan Store</h4>
            <ul className="space-y-2">
              <li>
                <a href={SITE.links.mainSite} className="text-sm text-muted-foreground hover:text-foreground transition">
                  Main site
                </a>
              </li>
              <li>
                <a href={SITE.links.features} className="text-sm text-muted-foreground hover:text-foreground transition">
                  Features
                </a>
              </li>
              <li>
                <a href={SITE.links.pricing} className="text-sm text-muted-foreground hover:text-foreground transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href={SITE.links.faq} className="text-sm text-muted-foreground hover:text-foreground transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href={SITE.links.signUp} className="text-sm font-semibold text-primary hover:underline">
                  Create free store →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE.name}. Powered by{' '}
            <a href={SITE.mainSiteUrl} className="font-medium hover:underline">keevanstore.in</a>.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about-keevan-store" className="hover:text-foreground">About</Link>
            <a href={SITE.mainSiteUrl} className="hover:text-foreground">Keevan Store</a>
            <a href={`${SITE.mainSiteUrl}/terms`} className="hover:text-foreground">Terms</a>
            <a href={`${SITE.mainSiteUrl}/privacy`} className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
