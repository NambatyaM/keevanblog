/**
 * Blog configuration — Keevan Blog
 * Niche: Make Money Selling Digital Products in East Africa
 * Primary purpose: marketing keevanstore.in + monetization
 */

export const SITE = {
  name: 'Keevan Blog',
  shortName: 'Keevan Blog',
  tagline: 'Sell Digital Products in East Africa',
  description:
    'Actionable guides on selling e-books, PDFs, templates, and digital downloads in Uganda, Kenya, Tanzania, and Rwanda. Built for creators who want to keep 90% of every sale.',
  // Canonical production domain — used for SEO even if dev runs elsewhere
  url: 'https://blog.keevanstore.in',
  mainSiteUrl: 'https://keevanstore.in',
  locale: 'en_US',
  lang: 'en',
  themeColor: '#00854a', // matches keevanstore.in brand
  twitterHandle: '@keevanstore',
  contactEmail: 'support@keevanstore.in',
  whatsapp: '+256768345905',
  // Social/utility links
  links: {
    mainSite: 'https://keevanstore.in',
    signUp: 'https://keevanstore.in/signup',
    pricing: 'https://keevanstore.in/pricing',
    features: 'https://keevanstore.in/features',
    about: 'https://keevanstore.in/about',
    faq: 'https://keevanstore.in/faq',
    contact: 'https://keevanstore.in/contact',
  },
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Start Selling', href: '/category/start-selling' },
  { label: 'Marketing', href: '/category/marketing' },
  { label: 'Make Money', href: '/category/make-money' },
  { label: 'Tools', href: '/category/tools' },
  { label: 'About Keevan Store', href: '/about-keevan-store' },
] as const;

export const CATEGORIES = [
  {
    slug: 'start-selling',
    name: 'Start Selling',
    description: 'Step-by-step guides to launch your first digital product store on Keevan Store.',
    color: '#00854a',
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    description: 'Promote your e-books and digital products across East African social channels.',
    color: '#0ea5e9',
  },
  {
    slug: 'make-money',
    name: 'Make Money',
    description: 'Pricing strategies, payout tips, and revenue playbooks for digital creators.',
    color: '#f59e0b',
  },
  {
    slug: 'tools',
    name: 'Creator Tools',
    description: 'Tools and AI apps that help East African creators produce and sell faster.',
    color: '#8b5cf6',
  },
  {
    slug: 'success-stories',
    name: 'Success Stories',
    description: 'Real creators across Uganda, Kenya, Tanzania, and Rwanda growing their income.',
    color: '#ef4444',
  },
] as const;

export const MONETIZATION = {
  // Google AdSense publisher ID (placeholder — replace after approval)
  adsensePublisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
  // Ad slot IDs (placeholders)
  adsenseSlots: {
    header: '1111111111',
    inArticle: '2222222222',
    sidebar: '3333333333',
  },
  // Affiliate programs we recommend (placeholders — replace with real IDs after sign-up)
  affiliateLinks: [
    {
      label: 'Start your free Keevan Store',
      url: 'https://keevanstore.in/signup',
      type: 'internal',
    },
    {
      label: 'Hostinger Web Hosting (affiliate)',
      url: 'https://hostinger.com?ref=keevanblog',
      type: 'external',
    },
    {
      label: 'Canva Pro for Creators (affiliate)',
      url: 'https://canva.com?ref=keevanblog',
      type: 'external',
    },
  ],
} as const;

export const SCHEDULER = {
  // Default posting frequency. Editable in admin dashboard.
  cronSchedule: '0 8 * * *', // daily at 08:00 Africa/Kampala
  postsPerRun: 1,
  paused: false,
} as const;

export type SiteConfig = typeof SITE;
