/**
 * AI engine for the auto-blog.
 *
 * Uses Z.AI API (free, no usage cap on this sandbox) to:
 *  1. Generate a SEO-optimized blog post (1500-2500 words) for a target keyword
 *  2. Generate AI thumbnail image for the post
 *
 * All output is post-processed into HTML + markdown + meta fields and saved to DB.
 */

import { db } from '@/lib/db';
import { SITE } from '@/lib/site-config';
import { execFile } from 'child_process';
import { promisify } from 'util';

export type GeneratedPost = {
  title: string;
  slug: string;
  excerpt: string;
  htmlContent: string;
  markdown: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  tags: string[];
  category: string;
  coverImagePrompt: string;
  wordCount: number;
  readingTime: number;
};

// ---------- Helpers ----------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.split(' ').length : 0;
}

function extractJsonBlock(text: string): any | null {
  // Try fenced ```json block first
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }
  // Try raw { ... } block (only if there's a closing brace)
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }
  // Fallback: regex-extract individual fields from a possibly-truncated JSON response.
  // This handles the case where the LLM hits max_tokens mid-stream.
  return extractFieldsByRegex(text);
}

function extractFieldString(text: string, field: string): string | null {
  // Match "field": "value"  where value uses escaped quotes
  const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 'm');
  const m = text.match(re);
  if (!m) return null;
  // Unescape JSON string escapes
  try {
    // Add a closing quote so JSON.parse can decode it
    return JSON.parse('"' + m[1] + '"');
  } catch {
    return m[1];
  }
}

function extractFieldArray(text: string, field: string): string[] | null {
  const re = new RegExp(`"${field}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const m = text.match(re);
  if (!m) return null;
  try {
    return JSON.parse('[' + m[1] + ']');
  } catch {
    // Fallback: extract quoted strings individually
    const items = m[1].match(/"((?:[^"\\]|\\.)*)"/g);
    return items ? items.map((s) => s.replace(/^"|"$/g, '')) : [];
  }
}

function extractFieldsByRegex(text: string): any | null {
  const title = extractFieldString(text, 'title');
  const markdown = extractFieldString(text, 'markdown');
  if (!title || !markdown) return null;

  return {
    title,
    markdown,
    metaTitle: extractFieldString(text, 'metaTitle') || title,
    metaDescription: extractFieldString(text, 'metaDescription') || '',
    excerpt: extractFieldString(text, 'excerpt') || '',
    coverImagePrompt:
      extractFieldString(text, 'coverImagePrompt') ||
      'flat illustration, East African creator commerce, vibrant green',
    tags: extractFieldArray(text, 'tags') || [],
    keywords: extractFieldArray(text, 'keywords') || [],
  };
}

// ---------- Article generation ----------

const SYSTEM_PROMPT = `You are an expert SEO content writer for the Keevan Store blog (blog.keevanstore.in).
Keevan Store (keevanstore.in) is an East African creator-commerce platform where creators sell e-books, PDFs, templates, and digital products.
- Markets: Uganda, Kenya, Tanzania, Rwanda
- Creators keep 90% of every sale; platform fee is 10%; no monthly fees
- Payments via Pesapal: mobile money (MTN, Airtel), cards, bank transfer
- Currencies: UGX, KES, TZS, RWF, USD
- File formats: PDF, EPUB, MOBI, ZIP up to 4MB
- Payouts to mobile money / bank; minimums: 50,000 UGX / 1,500 KES / 30,000 TZS / 20,000 RWF / 20 USD

Your writing rules:
- Always write in clear, natural English readable by East African audiences
- Lead with a strong hook in the first 100 words
- Use H2 (##) and H3 (###) headings to break up content
- Include practical, actionable steps with real examples (use UGX/KES/TZS/RWF figures where relevant)
- Mention Keevan Store naturally 2-4 times per article as the recommended platform, with a soft CTA
- Include realistic data points, scenarios, and East African context (cities, mobile money providers, local apps)
- Never invent fake testimonials, but you CAN use composite illustrative scenarios
- Word count target: 1500-2500 words
- Use markdown for the body (we'll convert to HTML)
- No emoji in the body text`;

export async function generateArticle(opts: {
  keyword: string;
  category: string;
}): Promise<GeneratedPost> {
  const { keyword, category } = opts;

  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) throw new Error('ZAI_API_KEY env var is required');
  const baseUrl = process.env.ZAI_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

  const userPrompt = `Write an SEO-optimized blog post for this focus keyword:

FOCUS KEYWORD: "${keyword}"
CATEGORY: ${category}
TARGET LENGTH: 1500-2200 words

Return a JSON object (wrap in \`\`\`json fence). Use plain ASCII quotes. Use \\n for newlines INSIDE string values. Do NOT use real newlines inside string values.

{
  "title": "Title with the keyword (60-75 chars)",
  "metaTitle": "SEO title 55-60 chars",
  "metaDescription": "Meta description 150-160 chars",
  "excerpt": "2-3 sentence intro hook (max 280 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["${keyword}", "related1", "related2"],
  "markdown": "## Introduction\\n\\nHook paragraph.\\n\\n## Section 1 Title\\n\\nBody...\\n\\n## Conclusion\\n\\nSoft CTA to https://keevanstore.in/signup",
  "coverImagePrompt": "flat vector illustration, East African creator commerce, vibrant green, about: ${keyword}"
}

Rules for the markdown:
- Use ## for H2, ### for H3, - for bullets, 1. for numbered lists
- 1500-2200 words
- Mention Keevan Store naturally 2-3 times
- Include at least one numbered step list
- End with a soft CTA linking to https://keevanstore.in/signup
- Do NOT include the title as # H1 — start with ## Introduction`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Z-AI-From': 'Z',
    },
    body: JSON.stringify({
      model: process.env.ZAI_MODEL || 'glm-4.7-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Z.AI API error ${response.status}: ${errBody}`);
  }
  const completion = await response.json();

  const raw = completion.choices?.[0]?.message?.content ?? '';
  const parsed = extractJsonBlock(raw);

  if (!parsed || !parsed.title || !parsed.markdown) {
    // Fallback — save raw text as article
    throw new Error('AI did not return parseable JSON. Raw: ' + raw.slice(0, 400));
  }

  const title: string = parsed.title.trim();
  const slugBase = slugify(title) || slugify(keyword);
  const slug = await ensureUniqueSlug(slugBase);

  const markdown: string = parsed.markdown;
  const htmlContent = markdownToHtml(markdown);
  const wordCount = countWords(htmlContent);
  const readingTime = Math.max(1, Math.round(wordCount / 220));

  return {
    title,
    slug,
    excerpt: (parsed.excerpt || '').trim(),
    htmlContent,
    markdown,
    metaTitle: (parsed.metaTitle || title).trim().slice(0, 65),
    metaDescription: (parsed.metaDescription || parsed.excerpt || '')
      .trim()
      .slice(0, 160),
    focusKeyword: keyword,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8) : [keyword],
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [],
    category,
    coverImagePrompt: parsed.coverImagePrompt || `flat illustration about ${keyword}, East African creator commerce, vibrant green and teal`,
    wordCount,
    readingTime,
  };
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  // Loop until we find a slug that doesn't exist
  // (use a small while loop with a count check)
  for (let i = 0; i < 50; i++) {
    const existing = await db.post.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${base}-${n++}`;
  }
  return `${base}-${Date.now()}`;
}

// ---------- Markdown -> HTML (minimal, server-side) ----------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMd(s: string): string {
  // Bold **x**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic *x* or _x_
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
  // Inline code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" rel="noopener nofollow" class="text-primary underline underline-offset-4 hover:text-primary/80">$1</a>'
  );
  return s;
}

export function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;
  let inList: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (inList) {
      out.push(inList === 'ul' ? '</ul>' : '</ol>');
      inList = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines (but close active lists)
    if (!trimmed) {
      closeList();
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inlineMd(escapeHtml(trimmed.slice(4)))}</h3>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeList();
      out.push(`<h2>${inlineMd(escapeHtml(trimmed.slice(3)))}</h2>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      closeList();
      out.push(`<h2>${inlineMd(escapeHtml(trimmed.slice(2)))}</h2>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      closeList();
      out.push('<hr />');
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      closeList();
      out.push(`<blockquote>${inlineMd(escapeHtml(trimmed.slice(2)))}</blockquote>`);
      i++;
      continue;
    }

    // Ordered list item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inList !== 'ol') {
        closeList();
        out.push('<ol>');
        inList = 'ol';
      }
      out.push(`<li>${inlineMd(escapeHtml(olMatch[2]))}</li>`);
      i++;
      continue;
    }

    // Unordered list item
    if (/^[-*+]\s+/.test(trimmed)) {
      if (inList !== 'ul') {
        closeList();
        out.push('<ul>');
        inList = 'ul';
      }
      out.push(`<li>${inlineMd(escapeHtml(trimmed.replace(/^[-*+]\s+/, '')))}</li>`);
      i++;
      continue;
    }

    // Paragraph
    closeList();
    out.push(`<p>${inlineMd(escapeHtml(trimmed))}</p>`);
    i++;
  }
  closeList();

  return out.join('\n');
}

// ---------- Cover image: REAL web image search via z-ai CLI ----------

const execFileAsync = promisify(execFile);

/**
 * Search the web for a real photo matching the post topic.
 * Uses z-ai image-search CLI (ZAI in-house image search service).
 * Returns the first landscape-oriented result's stable OSS URL.
 */
export async function searchRealImage(query: string): Promise<string | null> {
  try {
    // Build a clean natural-language query
    const cleanQuery = `${query} Africa digital creator`.slice(0, 200);

    const { stdout } = await execFileAsync(
      'z-ai',
      ['image-search', '-q', cleanQuery, '--count', '5', '--gl', 'us', '--no-rank'],
      { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }
    );

    // Extract the JSON object from stdout (CLI prints status lines before JSON)
    const jsonStart = stdout.indexOf('{');
    if (jsonStart === -1) return null;
    // Find matching closing brace
    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < stdout.length; i++) {
      if (stdout[i] === '{') depth++;
      else if (stdout[i] === '}') {
        depth--;
        if (depth === 0) { jsonEnd = i; break; }
      }
    }
    if (jsonEnd === -1) return null;

    const data = JSON.parse(stdout.slice(jsonStart, jsonEnd + 1));
    if (!data.success || !Array.isArray(data.results) || data.results.length === 0) {
      return null;
    }

    // Prefer landscape (width >= height) for blog cover
    const isLandscape = (r: any) => {
      const w = parseInt(String(r.original_width || '').replace('px', ''), 10);
      const h = parseInt(String(r.original_height || '').replace('px', ''), 10);
      return w > 0 && h > 0 && w >= h;
    };
    const landscape = data.results.filter(isLandscape);
    const pick = landscape[0] || data.results[0];
    return pick.original_url || null;
  } catch (err: any) {
    console.error('[searchRealImage] failed:', err?.message || err);
    return null;
  }
}

/**
 * Legacy alias kept for backward compat — now searches real images instead
 * of generating AI thumbnails.
 */
export async function generateThumbnail(prompt: string): Promise<string | null> {
  return searchRealImage(prompt);
}

// ---------- Top-level orchestrator ----------

export async function generateAndStorePost(opts: {
  keyword: string;
  category: string;
  skipImage?: boolean;
}): Promise<{ post: { slug: string; title: string } | null; error?: string }> {
  try {
    const generated = await generateArticle(opts);

    // Search the web for a real cover image (non-blocking — we save post even if image fails)
    let coverImage: string | null = null;
    if (!opts.skipImage) {
      // Use focus keyword as the search query for the most relevant real image
      coverImage = await searchRealImage(generated.focusKeyword);
    }

    const post = await db.post.create({
      data: {
        slug: generated.slug,
        title: generated.title,
        excerpt: generated.excerpt,
        content: generated.htmlContent,
        markdown: generated.markdown,
        coverImage,
        coverAlt: generated.title,
        category: generated.category,
        tags: generated.tags.join(','),
        keywords: generated.keywords.join(','),
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        focusKeyword: generated.focusKeyword,
        wordCount: generated.wordCount,
        readingTime: generated.readingTime,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    await db.scheduleLog.create({
      data: {
        action: 'published',
        postSlug: post.slug,
        message: `Generated post for keyword: ${opts.keyword}`,
      },
    });

    // Mark keyword used
    await db.keyword.upsert({
      where: { keyword: opts.keyword },
      create: {
        keyword: opts.keyword,
        category: opts.category,
        usedCount: 1,
        lastUsedAt: new Date(),
      },
      update: {
        usedCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return { post: { slug: post.slug, title: post.title } };
  } catch (err: any) {
    const message = err?.message || String(err);
    await db.scheduleLog.create({
      data: {
        action: 'failed',
        message: `keyword="${opts.keyword}" error=${message.slice(0, 500)}`,
      },
    });
    return { post: null, error: message };
  }
}

// ---------- Keyword picker ----------

export async function pickNextKeyword(): Promise<{ keyword: string; category: string } | null> {
  // Pick the least-recently-used seed keyword (or never used).
  // Prefer low-difficulty keywords to maximize ranking odds.
  const { SEED_KEYWORDS } = await import('@/lib/seed-keywords');

  // Pull used keywords map from DB
  const used = await db.keyword.findMany();
  const usedMap = new Map(used.map((k) => [k.keyword, k]));

  // Score each seed keyword: prefer low difficulty + never used + older lastUsedAt
  const difficultyScore = { low: 0, medium: 1, high: 2 };
  const scored = SEED_KEYWORDS.map((sk) => {
    const usedRow = usedMap.get(sk.keyword);
    const lastUsed = usedRow?.lastUsedAt?.getTime() ?? 0;
    return {
      ...sk,
      lastUsed,
      usedCount: usedRow?.usedCount ?? 0,
      score: difficultyScore[sk.difficulty] * 1000 + lastUsed / 1e6,
    };
  });
  scored.sort((a, b) => a.score - b.score);

  // Pick from the top 5 randomly (adds variety while still prioritizing)
  const pool = scored.slice(0, 5);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { keyword: pick.keyword, category: pick.category };
}
