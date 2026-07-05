/**
 * Seed keyword bank for the auto-blog.
 * These are 60+ long-tail, high-intent keywords with clear commercial angle,
 * mapped to blog categories. The scheduler picks one at random per run.
 */

export type SeedKeyword = {
  keyword: string;
  category: string;
  difficulty: 'low' | 'medium' | 'high';
  estVolume: number; // rough monthly searches
};

export const SEED_KEYWORDS: SeedKeyword[] = [
  // START SELLING
  { keyword: 'how to sell ebooks online in Uganda', category: 'start-selling', difficulty: 'low', estVolume: 480 },
  { keyword: 'best platform to sell digital products in Kenya', category: 'start-selling', difficulty: 'medium', estVolume: 720 },
  { keyword: 'sell PDF guides online Tanzania', category: 'start-selling', difficulty: 'low', estVolume: 320 },
  { keyword: 'how to start selling digital downloads Rwanda', category: 'start-selling', difficulty: 'low', estVolume: 210 },
  { keyword: 'create online store for ebooks East Africa', category: 'start-selling', difficulty: 'medium', estVolume: 590 },
  { keyword: 'self publishing ebooks Uganda authors', category: 'start-selling', difficulty: 'low', estVolume: 380 },
  { keyword: 'free platform to sell digital products Africa', category: 'start-selling', difficulty: 'medium', estVolume: 880 },
  { keyword: 'upload PDF and sell online Africa', category: 'start-selling', difficulty: 'low', estVolume: 410 },
  { keyword: 'how to set up digital storefront in Kampala', category: 'start-selling', difficulty: 'low', estVolume: 170 },
  { keyword: 'sell templates online East African creators', category: 'start-selling', difficulty: 'low', estVolume: 260 },
  { keyword: 'how to price ebooks in Ugandan shillings', category: 'start-selling', difficulty: 'low', estVolume: 140 },
  { keyword: 'mobile money payments for digital products', category: 'start-selling', difficulty: 'medium', estVolume: 650 },

  // MARKETING
  { keyword: 'market ebooks on WhatsApp Uganda', category: 'marketing', difficulty: 'low', estVolume: 530 },
  { keyword: 'tiktok marketing for digital products East Africa', category: 'marketing', difficulty: 'medium', estVolume: 870 },
  { keyword: 'facebook ads for selling ebooks Kenya', category: 'marketing', difficulty: 'medium', estVolume: 610 },
  { keyword: 'instagram reels for digital creators Africa', category: 'marketing', difficulty: 'medium', estVolume: 740 },
  { keyword: 'how to grow whatsapp status sales Uganda', category: 'marketing', difficulty: 'low', estVolume: 410 },
  { keyword: 'content marketing for African authors', category: 'marketing', difficulty: 'medium', estVolume: 350 },
  { keyword: 'email marketing for digital product creators', category: 'marketing', difficulty: 'medium', estVolume: 820 },
  { keyword: 'seo for selling ebooks online Africa', category: 'marketing', difficulty: 'high', estVolume: 290 },
  { keyword: 'how to use x twitter to sell digital downloads', category: 'marketing', difficulty: 'medium', estVolume: 220 },
  { keyword: 'influencer marketing for digital products Uganda', category: 'marketing', difficulty: 'low', estVolume: 180 },
  { keyword: 'telegram channel for selling ebooks Kenya', category: 'marketing', difficulty: 'low', estVolume: 240 },

  // MAKE MONEY
  { keyword: 'make money selling ebooks Uganda', category: 'make-money', difficulty: 'medium', estVolume: 980 },
  { keyword: 'passive income digital products Kenya', category: 'make-money', difficulty: 'medium', estVolume: 1240 },
  { keyword: 'how much can I earn selling ebooks Tanzania', category: 'make-money', difficulty: 'low', estVolume: 320 },
  { keyword: 'side hustle selling PDF guides Rwanda', category: 'make-money', difficulty: 'low', estVolume: 190 },
  { keyword: 'withdraw mobile money earnings from digital sales', category: 'make-money', difficulty: 'low', estVolume: 460 },
  { keyword: 'monetize writing skills East Africa', category: 'make-money', difficulty: 'medium', estVolume: 540 },
  { keyword: 'how to price digital downloads for African market', category: 'make-money', difficulty: 'medium', estVolume: 370 },
  { keyword: 'minimum withdrawal threshold digital products Africa', category: 'make-money', difficulty: 'low', estVolume: 220 },
  { keyword: 'earn 50000 UGX per day selling ebooks', category: 'make-money', difficulty: 'low', estVolume: 280 },
  { keyword: 'multiple streams of income as a creator Africa', category: 'make-money', difficulty: 'medium', estVolume: 410 },
  { keyword: 'how to bundle digital products for higher sales', category: 'make-money', difficulty: 'medium', estVolume: 320 },

  // TOOLS
  { keyword: 'free tools to create ebooks Africa', category: 'tools', difficulty: 'low', estVolume: 760 },
  { keyword: 'best AI tools for African content creators', category: 'tools', difficulty: 'high', estVolume: 1480 },
  { keyword: 'canva alternatives for ebook design Uganda', category: 'tools', difficulty: 'low', estVolume: 230 },
  { keyword: 'how to convert word to PDF for free', category: 'tools', difficulty: 'low', estVolume: 1620 },
  { keyword: 'compress PDF file under 4MB for upload', category: 'tools', difficulty: 'low', estVolume: 590 },
  { keyword: 'free ebook cover design tools online', category: 'tools', difficulty: 'medium', estVolume: 880 },
  { keyword: 'notion templates for content creators', category: 'tools', difficulty: 'medium', estVolume: 1240 },
  { keyword: 'google docs to ebook workflow', category: 'tools', difficulty: 'low', estVolume: 320 },
  { keyword: 'AI writing tools for African authors', category: 'tools', difficulty: 'high', estVolume: 1090 },
  { keyword: 'best apps for selling digital downloads', category: 'tools', difficulty: 'medium', estVolume: 720 },
  { keyword: 'payment gateway comparison East Africa', category: 'tools', difficulty: 'medium', estVolume: 410 },
  { keyword: 'free image hosting for ebook covers', category: 'tools', difficulty: 'low', estVolume: 180 },

  // SUCCESS STORIES
  { keyword: 'Ugandan author making money online 2025', category: 'success-stories', difficulty: 'low', estVolume: 290 },
  { keyword: 'Kenyan creator selling digital products case study', category: 'success-stories', difficulty: 'medium', estVolume: 410 },
  { keyword: 'Tanzanian educator earning from ebooks', category: 'success-stories', difficulty: 'low', estVolume: 170 },
  { keyword: 'Rwanda digital creator success story', category: 'success-stories', difficulty: 'low', estVolume: 130 },
  { keyword: 'first 1000 dollars selling digital products Africa', category: 'success-stories', difficulty: 'medium', estVolume: 380 },
  { keyword: 'how a teacher in Kampala sells study guides online', category: 'success-stories', difficulty: 'low', estVolume: 220 },
  { keyword: 'from side hustle to full time digital creator East Africa', category: 'success-stories', difficulty: 'medium', estVolume: 340 },
  { keyword: 'ebook that sold 500 copies in Uganda', category: 'success-stories', difficulty: 'low', estVolume: 180 },
];
