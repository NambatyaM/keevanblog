import { SITE } from '@/lib/site-config';
import { Store, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * In-article CTA block — promotes keevanstore.in.
 * Shown at the bottom of every blog post (lead-gen / affiliate slot).
 */
export function PostCTA() {
  return (
    <aside
      className="my-10 rounded-2xl overflow-hidden border"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: SITE.themeColor }}
          >
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: SITE.themeColor }}>
              Ready to sell your own digital product?
            </h3>
            <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
              Join Keevan Store and start selling e-books, PDFs, and templates to buyers across Uganda,
              Kenya, Tanzania, and Rwanda. Free to join. Keep 90% of every sale. Get paid via mobile money.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-5 text-sm text-foreground/80">
              {[
                'No monthly fees',
                '10% flat commission only on sales',
                'Pesapal mobile money payments',
                'Instant file delivery to buyers',
                'Withdraw to MTN or Airtel Money',
                'Live in under 10 minutes',
              ].map((b) => (
                <li key={b} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: SITE.themeColor }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <a
              href={SITE.links.signUp}
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition"
              style={{ backgroundColor: SITE.themeColor }}
            >
              Create Your Free Store <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
