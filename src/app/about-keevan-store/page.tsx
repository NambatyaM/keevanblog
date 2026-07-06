/**
 * About Keevan Store — dedicated marketing page that promotes keevanstore.in
 * Hand-written marketing copy about Keevan Store.
 * URL: /about-keevan-store
 */
import Link from 'next/link';
import { SITE } from '@/lib/site-config';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Store,
  Wallet,
  Shield,
  Zap,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Users,
  FileText,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import { AdsterraAd } from '@/components/AdsterraAd';

export const runtime = 'nodejs';

export const metadata = {
  title: `About Keevan Store — Sell Digital Products in East Africa | ${SITE.name}`,
  description:
    'Keevan Store is a creator-commerce platform for East African authors, educators, and creators. Sell e-books, PDFs, templates. Keep 90% of every sale. Free to join.',
  alternates: { canonical: `${SITE.url}/about-keevan-store` },
  openGraph: {
    title: `About Keevan Store — Sell Digital Products in East Africa | ${SITE.name}`,
    description:
      'Keevan Store is a creator-commerce platform for East African authors, educators, and creators. Sell e-books, PDFs, templates. Keep 90% of every sale. Free to join.',
    url: `${SITE.url}/about-keevan-store`,
    type: 'website',
  },
};

const FEATURES = [
  {
    icon: Store,
    title: 'Your own branded store',
    body: 'Every creator gets a personalized store URL and shareable product links the moment they sign up. No website builder, no coding, no hosting setup — your store is live in under 10 minutes.',
  },
  {
    icon: Smartphone,
    title: 'No buyer accounts needed',
    body: 'Customers pay through Pesapal and download instantly. No sign-up friction means more sales. Buyers don\'t need to create an account or remember a password to give you money.',
  },
  {
    icon: Wallet,
    title: 'Pesapal payments in your currency',
    body: 'Buyers pay with mobile money (MTN, Airtel), card, or bank transfer in UGX, KES, TZS, RWF, or USD. Keevan Store verifies every transaction server-side so you never ship a file for a failed payment.',
  },
  {
    icon: Zap,
    title: 'Instant file delivery',
    body: 'After payment verification, customers receive a signed download link. Files arrive in seconds — even while you sleep. No manual fulfillment, no email back-and-forth, no lost sales.',
  },
  {
    icon: TrendingUp,
    title: 'Sales and revenue analytics',
    body: 'Track views, purchases, download counts, and earnings in your dashboard. Know exactly what sells, when, and to which country. Use the data to double down on winners.',
  },
  {
    icon: FileText,
    title: 'Multiple file formats',
    body: 'Upload PDF, EPUB, MOBI, or ZIP files up to 4 MB. Customers download in their preferred format. Sell e-books, guides, templates, worksheets, or bundled resource packs.',
  },
  {
    icon: Shield,
    title: 'Protected file storage',
    body: 'Files are stored securely with signed download URLs and server-side payment verification. No leaks. No piracy. Your work stays yours.',
  },
  {
    icon: Globe2,
    title: 'Withdrawal to mobile money',
    body: 'Request withdrawals directly to your MTN or Airtel Money account or bank. Minimum thresholds: 50,000 UGX / 1,500 KES / 30,000 TZS / 20,000 RWF / 20 USD.',
  },
];

const STEPS = [
  {
    n: 1,
    title: 'Sign up free',
    body: 'Create your creator account. No credit card. No monthly fee. Your store URL is generated instantly.',
  },
  {
    n: 2,
    title: 'Upload your product',
    body: 'Add a PDF, EPUB, MOBI, or ZIP file (up to 4 MB). Set your price in UGX, KES, TZS, RWF, or USD. Add a cover and description.',
  },
  {
    n: 3,
    title: 'Share your store link',
    body: 'Your branded store link goes live immediately. Share it on WhatsApp, TikTok, X, Facebook, Instagram — anywhere your audience hangs out.',
  },
  {
    n: 4,
    title: 'Get paid',
    body: 'Keevan Store collects payments via Pesapal. You keep 90% of every sale. Request a withdrawal to mobile money or bank anytime you hit the minimum.',
  },
];

const STATS = [
  { value: '90%', label: 'Revenue kept by creators' },
  { value: '10%', label: 'Platform fee on sales only' },
  { value: 'UGX 0', label: 'Monthly fees' },
  { value: '4', label: 'East African countries' },
];

export default function AboutKeevanStorePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does Keevan Store cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Keevan Store charges zero monthly fees. The only cost is a 10% platform commission deducted when a product sells. If you do not make a sale, you pay nothing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who can sell on Keevan Store?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Any East African creator who owns the rights to their digital content. Authors, educators, coaches, template designers, and course creators all use Keevan Store. We currently serve Uganda, Kenya, Tanzania, and Rwanda.',
        },
      },
      {
        '@type': 'Question',
        name: 'What file formats can I upload?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can upload PDF, EPUB, MOBI, and ZIP files up to 4 MB. These cover e-books, guides, templates, worksheets, and bundled resources.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do payments work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Keevan Store uses Pesapal, East Africa\'s leading payment gateway. Buyers pay via mobile money (MTN, Airtel), debit or credit card, or bank transfer in UGX, KES, TZS, RWF, or USD.',
        },
      },
      {
        '@type': 'Question',
        name: 'When and how do I get paid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Earnings accumulate in your creator dashboard. Once your balance reaches the minimum withdrawal threshold for your currency, you can request a payout. Minimums are 50,000 UGX, 1,500 KES, 30,000 TZS, 20,000 RWF, or 20 USD. Platform administrators review and process payouts manually.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b" style={{ background: 'linear-gradient(135deg, #00854a 0%, #00b564 50%, #f0fdf4 100%)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-white">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <Store className="w-3.5 h-3.5" /> Powered by keevanstore.in
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
                Sell Digital Products in East Africa. Keep 90% of Every Sale.
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
                Keevan Store is the creator-commerce platform built for East African authors, educators,
                and digital creators. Upload your e-book, PDF guide, or template — set your price — share
                your store link — get paid via mobile money. No monthly fees. No technical skills required.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={SITE.links.signUp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#00854a] font-semibold px-6 py-3 rounded-lg hover:bg-white/95 transition shadow-lg"
                >
                  Create Your Free Store <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={SITE.links.features}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/25 transition"
                >
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What is Keevan Store */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">What is Keevan Store?</h2>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-foreground/85 leading-relaxed">
              Keevan Store is a creator-commerce platform purpose-built for the East African market.
              Launched to remove the friction that stops talented writers, educators, and creators from
              monetizing their knowledge, the platform lets anyone — from a teacher in Kampala to a
              coach in Nairobi — open a branded storefront and start selling e-books, PDF guides,
              templates, and digital bundles in under ten minutes.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Unlike global marketplaces that force African buyers to use credit cards and Western
              payment gateways, Keevan Store is built around <strong>Pesapal</strong>, East Africa's
              leading payment processor. That means your customers can pay with MTN Mobile Money,
              Airtel Money, Visa/Mastercard, or bank transfer in their local currency — UGX, KES, TZS,
              RWF, or USD. You collect money the way your audience already pays for everything else.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              The business model is simple and creator-friendly. There are <strong>zero monthly fees</strong>.
              You pay nothing to host your store, list products, or process payments. Keevan Store only
              earns when you do: a flat 10% commission per sale. The remaining 90% lands in your creator
              dashboard and is withdrawable to your mobile money or bank account once you hit the
              minimum threshold for your currency.
            </p>
          </div>
        </section>

        {/* Features grid */}
        <section className="bg-muted/30 border-y py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-center">Everything you need to sell digital products</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Every tool an East African creator needs to sell digital products directly to customers — all in one place.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="bg-background border rounded-xl p-6 hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#00854a15' }}>
                      <Icon className="w-5 h-5" style={{ color: '#00854a' }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-center">How selling on Keevan Store works</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">From upload to payout in four steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="relative bg-background border rounded-xl p-6">
                <div className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold mt-3 mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-gradient-to-b from-muted/40 to-background border-y py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Simple, creator-first pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">No monthly fees. No setup cost. Pay only when you sell.</p>
            <div className="bg-background border rounded-2xl p-8 sm:p-10 shadow-sm max-w-2xl mx-auto">
              <div className="text-6xl font-bold tracking-tight text-foreground">
                10%<span className="text-xl font-normal text-muted-foreground ml-2">per sale</span>
              </div>
              <p className="text-muted-foreground mt-3 mb-8">You keep 90% of every transaction. No hidden fees.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {[
                  'No monthly subscription',
                  'No setup fees',
                  'Free file hosting (up to 4 MB)',
                  'Free Pesapal payment processing',
                  'Withdrawals to mobile money or bank',
                  'Multi-currency: UGX, KES, TZS, RWF, USD',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{b}</span>
                  </div>
                ))}
              </div>
              <a
                href={SITE.links.signUp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition mt-8"
              >
                Create Your Free Store <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Who is it for */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-center">Who is Keevan Store for?</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">If you create digital content and live in East Africa, this is built for you.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Authors & Writers', body: 'Self-publish your e-book, set your price, and keep 90% instead of the 30-50% traditional publishers pay.' },
              { icon: Users, title: 'Educators & Coaches', body: 'Sell study guides, lesson plans, course PDFs, and downloadable worksheets to students across the region.' },
              { icon: TrendingUp, title: 'Template Designers', body: 'Sell Notion templates, Canva templates, business plan kits, and digital resource bundles up to 4 MB.' },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-background border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#00854a15' }}>
                    <Icon className="w-6 h-6" style={{ color: '#00854a' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Adsterra native ad before final CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AdsterraAd className="py-6" />
        </div>

        {/* Final CTA */}
        <section className="bg-primary text-primary-foreground py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Ready to start selling your digital products?</h2>
            <p className="text-primary-foreground/85 max-w-2xl mx-auto mb-7">
              Join East African creators already using Keevan Store. Free to start. Pay only when you sell.
              Your store is live the moment you sign up.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={SITE.links.signUp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-background text-primary font-semibold px-6 py-3 rounded-lg hover:bg-background/95 transition"
              >
                Create Your Free Store <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={SITE.links.faq}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-primary-foreground/40 text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary-foreground/10 transition"
              >
                Read the FAQ
              </a>
            </div>
            <p className="text-xs text-primary-foreground/70 mt-4">No credit card required.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
