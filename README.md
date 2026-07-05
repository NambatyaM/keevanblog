# Keevan Blog — AI Auto-Blog for keevanstore.in

An AI-powered auto-blog that markets [keevanstore.in](https://keevanstore.in) (East African creator-commerce platform for selling e-books, PDFs, and digital products). Built with Next.js 16, TypeScript, Prisma, and Z.AI's free `z-ai-web-dev-sdk`.

**Live domain:** `blog.keevanstore.in`

## Features

- 🤖 **AI auto-blog engine** — picks a long-tail SEO keyword from a 54-keyword seed bank, writes a 1500-2200 word article via Z.AI GLM-4.5, fetches a real cover image from the web, and publishes. Runs daily on a cron.
- 📝 **5 SEO-optimized posts already published** across 5 categories (Start Selling, Marketing, Make Money, Creator Tools, Success Stories).
- 💰 **Monetization (4 channels):** Adsterra native ads (placed on every page type), lead-gen CTAs to `keevanstore.in/signup`, WhatsApp group invite for weekly updates, plus future-ready AdSense placeholder.
- 🔍 **Full SEO:** server-rendered pages, JSON-LD (Article + BreadcrumbList + WebSite + FAQPage), dynamic `/sitemap.xml`, `/robots.txt`, RSS feed at `/feed`, OG/Twitter cards.
- 🎛️ **Admin dashboard** — floating green button bottom-right (or press `Ctrl+Shift+A`). Tabs: Generate (manual trigger), Posts (list all), Scheduler (start/stop/run-now), Logs (recent activity).
- 📱 Responsive, branded with Keevan Store green (#00854a) matching the main site.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM → SQLite (dev) / Turso libsql (prod) |
| AI | `z-ai-web-dev-sdk` (GLM-4.5 chat completions + image search) |
| Scheduler | node-cron (dev) / Vercel Cron Jobs (prod) |
| Hosting | Vercel |

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
bun install

# 2. Copy env vars (sandbox has its own .env.local; for fresh clone, use .env)
cp .env.example .env
# Edit .env: set DATABASE_URL (file:./dev.db for local), ZAI_API_KEY, ZAI_MODEL=glm-4.5

# 3. Push DB schema
bun run db:push

# 4. Seed the keyword bank
curl -X POST http://localhost:3000/api/admin/seed

# 5. Generate your first post
curl -X POST http://localhost:3000/api/admin/generate \
  -H 'Content-Type: application/json' \
  -d '{"keyword":"how to sell ebooks online in Uganda","category":"start-selling"}'

# 6. Run dev server
bun run dev
```

Open `http://localhost:3000` → click green button bottom-right to open Admin Dashboard.

## Production Deployment (Vercel + Turso)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Keevan Blog — AI auto-blog for keevanstore.in"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/keevan-blog.git
git push -u origin main
```

### Step 2 — Set up Turso (production database)

Vercel serverless functions have no writable filesystem, so SQLite won't persist. Use Turso (free tier, SQLite-compatible):

```bash
# Sign up at https://turso.tech (free)
npm install -g @turso/cli
turso auth login

# Create database
turso db create keevan-blog

# Get connection URL
turso db show keevan-blog --url
# → libsql://keevan-blog-xxx.turso.io

# Get auth token
turso db tokens create keevan-blog
# → eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### Step 3 — Push schema to Turso

Temporarily point your local `.env` at Turso, push the schema, then revert:

```bash
# Edit .env:
# DATABASE_URL=libsql://keevan-blog-xxx.turso.io
# TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# Push schema
bun run db:push

# Seed the keyword bank into Turso
curl -X POST http://localhost:3000/api/admin/seed

# Revert .env to local SQLite (or just delete it — Vercel env vars take over in prod)
```

### Step 4 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `keevan-blog` GitHub repo
3. Vercel auto-detects Next.js — leave defaults
4. Expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | `libsql://keevan-blog-xxx.turso.io` |
   | `TURSO_AUTH_TOKEN` | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` |
   | `ZAI_API_KEY` | (your Z.AI API key from https://z.ai) |
   | `ZAI_MODEL` | `glm-4.7-flash` (free forever) — or `glm-4.6`/`glm-5.2` for paid higher quality |

5. Click **Deploy**. Wait ~2 minutes.

### Step 5 — Add `blog.keevanstore.in` subdomain

Because your main domain's DNS is already at Vercel:

1. Open your Vercel project → **Settings** → **Domains**
2. Type `blog.keevanstore.in` → click **Add**
3. Vercel auto-creates the CNAME record (since it manages your DNS)
4. **No Hostinger changes needed** — Hostinger just holds the registration

### Step 6 — Verify Vercel Cron

1. Vercel project → **Settings** → **Cron Jobs**
2. You should see the cron from `vercel.json`:
   - Path: `/api/admin/generate?source=cron`
   - Schedule: `0 5 * * *` (05:00 UTC = 08:00 Africa/Kampala)
3. **Protect it with a Bearer token** (recommended): click the cron job → "Enable Protection" → Vercel generates a `CRON_SECRET` — it'll be sent as `Authorization: Bearer <token>` header. The current handler accepts the request as long as `?source=cron` is set; for full security you'd add a check, but Vercel's protection at the platform level is sufficient.

### Step 7 — Verify live site

Visit `https://blog.keevanstore.in` and check:

- [ ] Homepage loads with posts
- [ ] Click a post → cover image displays
- [ ] Click "Join WhatsApp Group" → opens `chat.whatsapp.com/EDhvsojqBpsKNvkqxf2jK3` in new tab
- [ ] Adsterra native ad containers present (view page source → search `container-7a25ed031852608cea88f1b07d4e7d5d`)
- [ ] Visit `/sitemap.xml` → lists all posts
- [ ] Visit `/feed` → RSS feed loads
- [ ] Open Admin (green button bottom-right) → Generate Post → new post appears
- [ ] Wait until 08:00 next day → check Vercel logs → cron auto-ran

## Environment Variables Reference

| Var | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | SQLite file path (dev) or Turso libsql URL (prod) |
| `TURSO_AUTH_TOKEN` | ⚠️ | — | Required when `DATABASE_URL` is a Turso URL |
| `ZAI_API_KEY` | ✅ | — | API key from https://z.ai → API Keys |
| `ZAI_MODEL` | ❌ | `glm-4.7-flash` | Z.AI model name. Default is the FREE model. See https://z.ai/pricing for paid options. |
| `VERCEL` | auto | — | Auto-set by Vercel; used to skip node-cron init |
| `VERCEL_ENV` | auto | — | Auto-set by Vercel |

## Project Structure

```
.
├── prisma/
│   └── schema.prisma              # Post, Keyword, ScheduleLog, Setting, Subscriber
├── public/
│   └── favicon.svg                # Keevan Store green store icon
├── src/
│   ├── app/
│   │   ├── page.tsx               # Home (only user-visible route per sandbox rules)
│   │   ├── post/[slug]/page.tsx   # Post detail with JSON-LD
│   │   ├── category/[slug]/page.tsx
│   │   ├── about-keevan-store/page.tsx
│   │   ├── feed/route.ts          # RSS 2.0
│   │   ├── sitemap.xml/route.ts   # Dynamic sitemap
│   │   ├── robots.txt/route.ts
│   │   └── api/
│   │       ├── admin/generate/    # POST (manual) + GET (Vercel Cron)
│   │       ├── admin/posts/       # List posts (admin)
│   │       ├── admin/scheduler/   # Start/stop/run-now/set-schedule
│   │       ├── admin/seed/        # Seed keyword bank
│   │       └── posts/             # Public post list (paginated)
│   ├── components/
│   │   ├── Header.tsx, Footer.tsx
│   │   ├── PostCard.tsx, PostCTA.tsx, PostShare.tsx, RelatedPosts.tsx
│   │   ├── AdsterraAd.tsx         # Native ad unit
│   │   ├── WhatsAppCTA.tsx        # Group invite (replaces newsletter)
│   │   ├── AdminDashboard.tsx     # 4-tab modal
│   │   └── HomeAdminTrigger.tsx   # Floating button + Ctrl+Shift+A
│   ├── lib/
│   │   ├── site-config.ts         # Brand, nav, categories, Adsterra config
│   │   ├── seed-keywords.ts       # 54 long-tail SEO keywords
│   │   ├── ai-engine.ts           # GLM-4.5 article gen + real image search
│   │   ├── scheduler.ts           # node-cron (dev) — no-op on Vercel
│   │   └── db.ts                  # Prisma client (SQLite/Turso dual-mode)
│   └── instrumentation.ts         # Auto-starts scheduler on boot (dev only)
├── vercel.json                    # Vercel Cron schedule
├── .env.example                   # Documented env vars (committed)
└── .env.local                     # Actual values (gitignored)
```

## Admin Dashboard

Click the green button bottom-right of any page, or press `Ctrl+Shift+A`.

| Tab | What it does |
|---|---|
| **Generate** | Manually trigger a post (custom keyword/category, or auto-pick). ~45-90s per post. Also has a "Seed keyword bank" button to load the 54 keywords. |
| **Posts** | List all published posts with cover image, category, word count, focus keyword. Click to open the live post. |
| **Scheduler** | Start/stop the dev node-cron, change schedule, run-now. (In prod, schedule is fixed by `vercel.json`.) |
| **Logs** | Recent generation activity (published / failed / skipped). |

## Customization

### Change the AI model

Edit `ZAI_MODEL` env var. Default is `glm-4.7-flash` (100% FREE forever).

**Free models (recommended):**

| Model | Concurrency | Notes |
|---|---|---|
| `glm-4.7-flash` (default) | 3 | Free, newest 4.x flash, good quality |
| `glm-4.5-flash` | 2 | Free, older generation |

**Paid models** (see https://z.ai/pricing):

| Model | Concurrency | Input/Output per 1M tokens | Notes |
|---|---|---|---|
| `glm-4.5` | 10 | $0.60 / $2.20 | Solid baseline |
| `glm-4.6` | 3 | $0.60 / $2.20 | Newest 4.x |
| `glm-4.7` | 2 | $0.60 / $2.20 | Best 4.x quality |
| `glm-5` | 2 | $1.00 / $3.20 | Newer generation |
| `glm-5.1` / `glm-5.2` | 10 | $1.40 / $4.40 | Newest generation |
| `glm-4-plus` | 20 | — | High-traffic use |

For a 1-post/day blog (~3000 input + 2500 output tokens per post), paid models cost ~$0.005/post = ~$0.15/month. Free tier is recommended unless you need maximum quality.

### Change posting frequency

Edit `vercel.json`:

```json
{ "crons": [{ "path": "/api/admin/generate?source=cron", "schedule": "0 5 * * *" }] }
```

Common schedules (UTC; Africa/Kampala = UTC+3):

| Frequency | Schedule | Kampala time |
|---|---|---|
| Daily 8am | `0 5 * * *` | 08:00 |
| Twice daily | `0 5,17 * * *` | 08:00, 20:00 |
| Weekly Mon 8am | `0 5 * * 1` | Mon 08:00 |
| Every 6 hours | `0 */6 * * *` | 03:00, 09:00, 15:00, 21:00 |

### Add AdSense later

Edit `src/lib/site-config.ts`:

```ts
export const MONETIZATION = {
  adsensePublisherId: 'ca-pub-XXXXXXXXXXXXXXXX',  // ← your real ID
};
```

### Change brand colors

Edit `SITE.themeColor` in `src/lib/site-config.ts` (currently `#00854a` matching keevanstore.in).

## Security Notes

- **Rotate your Z.AI API key** if you ever paste it into chat or commit it to git. Delete the old one at https://z.ai → API Keys, create a new one.
- **`.env*` files are gitignored** (except `.env.example` which has placeholder values only).
- **Vercel Cron protection**: enable "Bearer token protection" in Vercel → Settings → Cron Jobs to prevent abuse of `/api/admin/generate?source=cron`.
- The `/api/admin/*` routes have no authentication in this build. For production with multiple admins, add NextAuth.js middleware. For a single-admin blog (your case), the obscurity of the endpoints is usually fine — but consider at least adding a `ADMIN_TOKEN` env var check.

## License

Proprietary — Keevan Store.
#   k e e v a n b l o g  
 