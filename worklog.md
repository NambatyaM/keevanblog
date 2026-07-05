# Keevan Blog — Worklog

---
Task ID: all
Agent: main (Super Z)
Task: Build AI auto-blog website at blog.keevanstore.in that:
  - Uses free AI APIs (z-ai-web-dev-sdk) that never stop
  - Ranks well in search
  - Monetizes content
  - Markets keevanstore.in (East African creator-commerce platform for selling e-books/digital products)

Work Log:
- Researched keevanstore.in via z-ai page_reader to extract business model: 10% commission, 90% creator payout, Pesapal payments (MTN/Airtel mobile money, cards, bank), UGX/KES/TZS/RWF/USD currencies, 4MB max file upload, min withdrawal 50,000 UGX
- Decided niche: "Make Money Selling Digital Products in East Africa" — perfectly aligned to keevanstore.in marketing
- Decided monetization stack: (1) Lead-gen CTAs to keevanstore.in (primary), (2) Affiliate links to creator tools, (3) AdSense slots (placeholder, ready after approval), (4) Newsletter capture for retargeting
- Initialized Next.js 16 project via fullstack-dev skill (already present, just needed setup confirmation)
- Installed node-cron for scheduling
- Wrote Prisma schema (Post, Keyword, ScheduleLog, Setting, Subscriber) and pushed to SQLite
- Wrote site-config.ts with brand colors matching keevanstore.in (#00854a), nav links, categories, affiliate links, scheduler defaults
- Wrote seed-keywords.ts with 54 long-tail SEO keywords mapped to 5 categories (start-selling, marketing, make-money, tools, success-stories)
- Wrote ai-engine.ts: generateArticle() uses z-ai SDK chat completions with SEO-optimized JSON-returning prompt; markdownToHtml() converts MD body to styled HTML; generateThumbnail() uses z-ai images API; generateAndStorePost() orchestrates end-to-end; pickNextKeyword() selects least-recently-used keyword prioritizing low-difficulty
- Wrote scheduler.ts: node-cron task running daily at 08:00 Africa/Kampala; auto-starts on server boot via instrumentation.ts; configurable schedule + pause via admin API
- Wrote 6 API routes: /api/admin/generate, /api/admin/posts, /api/admin/scheduler, /api/admin/seed, /api/posts, /api/subscribe
- Wrote 3 SEO routes: /sitemap.xml (dynamic), /robots.txt, /feed (RSS 2.0)
- Wrote /post/[slug] page with JSON-LD Article + BreadcrumbList schemas, OG/Twitter cards, prose-styled body, in-article CTA, related posts, share buttons
- Wrote /category/[slug] page with hero, post grid, CTA
- Wrote /about-keevan-store hand-crafted marketing page promoting keevanstore.in with features, pricing, how-it-works, FAQ schema (8 sections, all >150 words)
- Built components: Header (responsive w/ mobile menu), Footer (with newsletter capture + WhatsApp + main site links), PostCard, PostCTA (lead-gen block), NewsletterCTA, PostShare (X/FB/LinkedIn/copy), RelatedPosts, AdminDashboard (modal with 4 tabs: Generate/Posts/Scheduler/Logs)
- Built HomeAdminTrigger — floating button (bottom-right) + Ctrl+Shift+A keyboard shortcut to open admin
- Replaced default / page with full blog homepage (hero, latest posts, categories, marketing CTA, newsletter)
- Updated layout.tsx with proper blog metadata, RSS alternate link, theme-color, favicon, AdSense account placeholder
- Created favicon.svg matching keevanstore.in brand (green store icon)
- Fixed 2 bugs: (1) removed conflicting public/robots.txt so /robots.txt route works, (2) added 'use client' to NewsletterCTA to allow inline form handler
- Improved ai-engine JSON extractor with regex fallback for truncated LLM responses (when max_tokens is hit mid-stream)
- Seeded keyword bank: 54 keywords inserted
- Generated 5 initial blog posts (one per category) to seed the homepage — each ~1500-2200 words with AI cover image:
  1. How to Sell Ebooks Online in Uganda: Complete Guide (start-selling)
  2. How to Market Ebooks on WhatsApp Uganda (marketing)
  3. How to Make Money Selling Ebooks in Uganda: A Complete Guide (make-money)
  4. Free Tools to Create Ebooks in Africa: Your Complete Guide (tools)
  5. Ugandan Authors Making Money Online in 2025: Success Stories (success-stories)
- Ran ESLint — clean, no errors
- Verified all routes return 200: /, /post/[slug] (5 posts), /category/[slug] (5 categories), /about-keevan-store, /sitemap.xml, /robots.txt, /feed
- Used agent-browser to verify: homepage renders with all 5 posts in grid + category section + CTAs; admin dashboard opens via floating button and all 4 tabs work; post detail page renders full article body; about page renders marketing copy; mobile viewport (375x667) renders correctly; no JS console errors

Stage Summary:
- Blog niche: Make Money Selling Digital Products in East Africa
- Brand: Keevan Blog (blog.keevanstore.in) — green color #00854a matching main site
- AI stack: z-ai-web-dev-sdk (chat completions for article, images API for cover) — free, no cap
- Scheduler: node-cron daily 08:00 Africa/Kampala — auto-starts on boot, configurable in admin
- 54 seed keywords across 5 categories; 5 posts already published
- Monetization: 4 channels (lead-gen to keevanstore.in, affiliate links, AdSense placeholders, newsletter)
- SEO: server-rendered, JSON-LD (Article + BreadcrumbList + WebSite + FAQPage), dynamic sitemap.xml, RSS feed, semantic HTML, OG/Twitter cards
- Admin dashboard: floating button bottom-right + Ctrl+Shift+A — Generate / Posts / Scheduler / Logs tabs
- Production domain: blog.keevanstore.in (configurable in src/lib/site-config.ts)
- Lint: clean
- All routes verified via agent-browser

---
Task ID: production-prep
Agent: main (Super Z)
Task: Prep the code for production deployment on Vercel + Turso:
  - Pin AI engine to glm-4.5 (configurable via ZAI_MODEL env var)
  - Switch Prisma from SQLite to Turso (libsql driver) with dual-mode (local file OR Turso URL)
  - Add vercel.json with daily cron schedule
  - Add GET handler to /api/admin/generate for Vercel Cron
  - Add .env.example + .env.local + update .gitignore
  - Add README.md with full deployment instructions

Work Log:
- Edited ai-engine.ts: added `model: process.env.ZAI_MODEL || 'glm-4.5'` to chat completions call
- Installed @prisma/adapter-libsql and @libsql/client packages
- Updated prisma/schema.prisma: removed previewFeatures (deprecated warning), kept provider=sqlite (works for both file + libsql via adapter)
- Rewrote src/lib/db.ts: dual-mode client that auto-detects DATABASE_URL scheme (file: → local SQLite, libsql:/http:/https: → Turso with libsql adapter). Uses PrismaLibSql adapter (correct casing is PrismaLibSql not PrismaLibSQL)
- Fixed initial 500 error: export name was PrismaLibSQL, should be PrismaLibSql (lowercase Q)
- Created vercel.json: { crons: [{ path: "/api/admin/generate?source=cron", schedule: "0 5 * * *" }] } — 05:00 UTC = 08:00 Africa/Kampala
- Updated /api/admin/generate/route.ts: added GET handler that (1) checks ?source=cron, (2) blocks non-cron GETs in production, (3) checks scheduler.paused setting, (4) picks next keyword, (5) fires generation as background promise, (6) returns 200 immediately. Also added maxDuration=300 for manual generations on Pro/Enterprise plans.
- Updated scheduler.ts: initSchedulerIfEnabled() is now a no-op when VERCEL=1 or VERCEL_ENV is set (Vercel Cron handles scheduling instead)
- Updated .gitignore: explicitly exclude .env* but allow .env.example (!.env.example)
- Created .env.example: documents DATABASE_URL (both local + Turso formats), TURSO_AUTH_TOKEN, ZAI_API_KEY, ZAI_MODEL=glm-4.5, VERCEL env vars (auto-set), optional SITE_URL override
- Created .env.local: contains the user's actual Z.AI API key for sandbox testing (gitignored; user will rotate before deploy)
- Created README.md: 250-line comprehensive deployment guide with 7 step-by-step instructions, env var reference table, project structure tree, admin dashboard docs, customization guide (model swap, cron schedule, AdSense, brand colors), and security notes
- Verified: all 9 routes return 200; ESLint clean; tested GET cron handler end-to-end — returned immediately with triggered=true, generated "Sell Templates Online: East African Creator's Complete Guide" (2238 words) in background within 90s; agent-browser confirms 7 posts visible, 1 Adsterra container, 3 WhatsApp links on homepage

Stage Summary:
- Code is now Vercel-deploy-ready
- AI model: GLM-4.5 (10 concurrency, configurable via ZAI_MODEL env var)
- Database: dual-mode — SQLite file for dev, Turso libsql for prod (auto-detected from DATABASE_URL)
- Cron: Vercel Cron Jobs triggers /api/admin/generate?source=cron daily at 05:00 UTC (08:00 Kampala)
- All env vars documented in .env.example and README.md
- 7 posts now in DB (5 original + 2 cron-triggered test generations, all with real images)
- Security: .env* gitignored, .env.example has placeholders only, README has security notes section
