'use client';

import Link from 'next/link';
import { SITE, NAV_LINKS, CATEGORIES } from '@/lib/site-config';
import { Store, MessageCircle, Mail, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* WhatsApp group invite — replaces the old newsletter capture */}
        <div
          className="bg-background border rounded-xl p-6 sm:p-8 mb-10 -mt-20 relative shadow-sm overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3" style={{ backgroundColor: '#25D36620', color: '#128C4A' }}>
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Group
              </div>
              <h3 className="text-xl font-bold mb-2">Join our weekly updates group</h3>
              <p className="text-sm text-foreground/80">
                Get one actionable tip every week on selling digital products in East Africa.
                New post alerts, marketing strategies, and creator Q&A — direct to your phone.
              </p>
            </div>
            <div className="flex md:justify-end">
              <a
                href={SITE.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition shadow-md w-full md:w-auto justify-center"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                Join WhatsApp Group
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
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
                target="_blank"
                rel="noopener noreferrer"
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
              <a
                href={SITE.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium hover:text-foreground transition"
                style={{ color: '#128C4A' }}
              >
                <MessageCircle className="w-4 h-4" /> Join weekly updates group →
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

          {/* Main site links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Keevan Store</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={SITE.links.mainSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Main site
                </a>
              </li>
              <li>
                <a
                  href={SITE.links.features}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href={SITE.links.pricing}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href={SITE.links.faq}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href={SITE.links.signUp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Create free store →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE.name}. Powered by{' '}
            <a
              href={SITE.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              keevanstore.in
            </a>.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about-keevan-store" className="hover:text-foreground">About</Link>
            <a
              href={SITE.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Keevan Store
            </a>
            <a
              href={SITE.links.terms}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Terms
            </a>
            <a
              href={SITE.links.privacy}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
