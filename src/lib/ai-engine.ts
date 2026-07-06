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

// ---------- Fetch with retry + timeout ----------

async function fetchWithRetry(url: string, options: RequestInit, retries = 5): Promise<Response> {
  const timeoutMs = 120000;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (response.ok) return response;
      // 429 = rate limited — wait much longer (30s, 60s, 120s...)
      if (response.status === 429) {
        if (attempt >= retries) return response;
        const delay = 30000 * Math.pow(2, attempt);
        console.warn(`[z-ai] 429 rate limited — retrying in ${delay/1000}s (attempt ${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      if (attempt >= retries) return response;
      // Other server errors (5xx) — exponential backoff
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt >= retries) throw err;
      const delay = 2000 * Math.pow(2, attempt);
      console.warn(`[z-ai] fetch error (${err?.name || 'network'}) — retrying in ${delay/1000}s (attempt ${attempt + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('fetchWithRetry: all attempts exhausted');
}

// ---------- Article generation ----------

const SYSTEM_PROMPT = `You are an expert SEO content writer for the Keevan Store blog (blog.keevanstore.in). You write like Neil Patel: data-driven, actionable, and conversion-focused.

Keevan Store (keevanstore.in) is an East African creator-commerce platform where creators sell e-books, PDFs, templates, and digital products.
- Markets: Uganda, Kenya, Tanzania, Rwanda
- Creators keep 90% of every sale; platform fee is 10%; no monthly fees
- Payments via Pesapal: mobile money (MTN, Airtel), cards, bank transfer
- Currencies: UGX, KES, TZS, RWF, USD
- File formats: PDF, EPUB, MOBI, ZIP up to 4MB
- Payouts to mobile money / bank; minimums: 50,000 UGX / 1,500 KES / 30,000 TZS / 20,000 RWF / 20 USD

=== NEIL PATEL CONTENT FRAMEWORK ===

1. HOOK in the first 100 words: Start with a bold statement, surprising stat, or relatable pain point. Preview the value the reader will get. Make them think "I need this."

2. STRUCTURE for scannability:
   - Keep most sentences under 20 words
   - Use H2 every 300-400 words, H3 every 150-200 words
   - Break up text with bullet lists, numbered steps, and short paragraphs (2-4 sentences max)
   - Include one FAQ section near the end with 3-5 questions (LLMs love this)
   - Add a "Key Takeaways" or summary box at the top after the intro

3. ANSWER REAL QUESTIONS: Write for decisions, not clicks. Address:
   - "How do I start?" (step-by-step guide)
   - "How much can I earn?" (real numbers in UGX/KES/TZS/RWF)
   - "What's the best option for me?" (comparison)
   - "Is it worth the cost?" (value analysis)
   - "What tools/platforms do I need?" (specific recommendations)

4. E-E-A-T SIGNALS (Google's quality framework):
   - Include specific data points and statistics (use realistic East African numbers)
   - Cite named sources or expert perspectives
   - Reference real cities (Kampala, Nairobi, Dar es Salaam, Kigali)
   - Name actual mobile money providers (MTN MoMo, Airtel Money, M-Pesa)
   - Use concrete examples, not vague generalities

5. CONVERSION COPY:
   - Each section should build toward the CTA
   - Remove friction before the CTA (answer objections proactively)
   - Mention Keevan Store 3-4 times naturally as the solution
   - End with a clear, single CTA
   - Use "you" and "your" throughout to speak directly to the reader

6. WRITING STYLE:
   - Clear, direct English readable by East African audiences
   - Conversational but authoritative — like a knowledgeable friend giving advice
   - No fluff, no filler words, no robotic phrasing
   - Never use emoji in the body text
   - Write the way people actually ask questions (for LLM/voice search optimization)
   - Use semantic, natural keywords — do not keyword-stuff
   - Word count: 2000-2800 words (in-depth content ranks higher)

7. FORMAT:
   - No H1 (title is handled separately)
   - Start with ## Introduction
   - Use ## for main sections, ### for subsections
   - Include a ## Frequently Asked Questions section with 3-5 Q&As
   - End with ## Conclusion and a strong CTA linking to https://keevanstore.in/signup`;

export async function generateArticle(opts: {
  keyword: string;
  category: string;
}): Promise<GeneratedPost> {
  const { keyword, category } = opts;

  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) throw new Error('ZAI_API_KEY env var is required');
  const baseUrl = process.env.ZAI_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

  const userPrompt = `Write an SEO-optimized blog post following Neil Patel's content methodology for this focus keyword:

FOCUS KEYWORD: "${keyword}"
CATEGORY: ${category}
TARGET LENGTH: 2000-2800 words

Return a JSON object (wrap in \`\`\`json fence). Use plain ASCII quotes. Use \\n for newlines INSIDE string values. Do NOT use real newlines inside string values.

{
  "title": "Title with the keyword near the beginning (60-75 chars, compelling, includes keyword)",
  "metaTitle": "SEO title 55-60 chars with keyword",
  "metaDescription": "Meta description 150-160 chars with keyword and value prop",
  "excerpt": "2-3 sentence intro hook (max 280 chars) that makes reader NEED to continue",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "keywords": ["${keyword}", "related1", "related2", "related3"],
  "markdown": "## Introduction\\n\\nHook paragraph with bold claim or stat. Preview what they will learn.\\n\\n## Section 1 Title\\n\\nBody with specific East African examples, real numbers in UGX/KES/TZS/RWF.\\n\\n## Frequently Asked Questions\\n\\n### Q1: Question?\\nAnswer.\\n\\n### Q2: Question?\\nAnswer.\\n\\n## Conclusion\\n\\nSummary + CTA to https://keevanstore.in/signup",
  "coverImagePrompt": "flat vector illustration, East African creator commerce, vibrant green, about: ${keyword}"
}

MARKDOWN STRUCTURE RULES:
- Start with ## Introduction (attention hook in first 100 words)
- Follow with 4-6 ## main sections covering: the problem, step-by-step solution, real examples, comparison if relevant, actionable tips
- Include bullet lists (-), numbered steps (1.), and short paragraphs (2-4 sentences)
- Add ## Frequently Asked Questions with 3-5 real questions your audience would ask
- End with ## Conclusion + strong CTA to https://keevanstore.in/signup
- Mention Keevan Store naturally 3-4 times as the recommended solution
- Use specific East African cities, mobile money providers, currencies (UGX/KES/TZS/RWF)
- Keep sentences short (under 20 words). No emoji. No fluff.
- Include at least one numbered step-by-step guide section`;

  const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
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

function slugifyId(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

    // Headings with anchor IDs
    if (trimmed.startsWith('### ')) {
      closeList();
      const text = trimmed.slice(4);
      const id = slugifyId(text);
      out.push(`<h3 id="${id}">${inlineMd(escapeHtml(text))}</h3>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeList();
      const text = trimmed.slice(3);
      const id = slugifyId(text);
      out.push(`<h2 id="${id}">${inlineMd(escapeHtml(text))}</h2>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      closeList();
      const text = trimmed.slice(2);
      const id = slugifyId(text);
      out.push(`<h2 id="${id}">${inlineMd(escapeHtml(text))}</h2>`);
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

// ---------- Cover image ----------

export async function searchRealImage(query: string): Promise<string | null> {
  return null;
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
