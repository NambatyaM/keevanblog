'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SITE, NAV_LINKS } from '@/lib/site-config';
import { Menu, X, Store } from 'lucide-react';

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: SITE.themeColor }}
          >
            <Store className="w-5 h-5" />
          </span>
          <span className="hidden sm:inline">{SITE.name}</span>
          <span className="sm:hidden">Keevan</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={SITE.links.signUp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: SITE.themeColor }}
          >
            Start Selling Free
          </a>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={SITE.links.signUp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 px-3 py-2 text-sm font-semibold text-white rounded-md text-center"
              style={{ backgroundColor: SITE.themeColor }}
            >
              Start Selling Free
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
