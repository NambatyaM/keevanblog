'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Rocket,
  Pause,
  Play,
  RefreshCw,
  ListChecks,
  Trash2,
  Settings,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/site-config';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  focusKeyword: string;
  wordCount: number;
  readingTime: number;
  coverImage: string | null;
  status: string;
  publishedAt: string;
};

type SchedulerStatus = {
  status: { running: boolean; schedule: string | null; paused: boolean };
  schedule: string;
  paused: boolean;
  recentLogs: { id: string; action: string; message: string | null; postSlug: string | null; createdAt: string }[];
};

export function AdminDashboard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'generate' | 'posts' | 'scheduler' | 'logs'>('generate');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [customKeyword, setCustomKeyword] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [scheduleInput, setScheduleInput] = useState('0 8 * * *');

  const loadScheduler = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/scheduler');
      if (res.ok) {
        const data = await res.json();
        setScheduler(data);
        if (data.schedule) setScheduleInput(data.schedule);
      }
    } catch {}
  }, []);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await fetch('/api/admin/posts?limit=100');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {} finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadScheduler();
      loadPosts();
    }
  }, [open, loadScheduler, loadPosts]);

  async function handleGenerate() {
    setGenerating(true);
    setGenResult(null);
    try {
      const body: any = {};
      if (customKeyword.trim()) body.keyword = customKeyword.trim();
      if (customCategory) body.category = customCategory;
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenResult({ type: 'success', message: `Published: "${data.post.title}" → /post/${data.post.slug}` });
        setCustomKeyword('');
        loadPosts();
      } else {
        setGenResult({ type: 'error', message: data.error || data.message || 'Generation failed' });
      }
    } catch (err: any) {
      setGenResult({ type: 'error', message: err?.message || 'Network error' });
    } finally {
      setGenerating(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setGenResult({ type: 'success', message: `Seeded ${data.inserted} keywords (total: ${data.total}).` });
      } else {
        setGenResult({ type: 'error', message: 'Seed failed' });
      }
    } finally {
      setSeeding(false);
    }
  }

  async function handleSchedulerAction(action: string, extra?: any) {
    try {
      const res = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      if (res.ok) {
        await loadScheduler();
      }
    } catch {}
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-background border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Admin Dashboard</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Keevan Blog</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'generate' as const, label: 'Generate', icon: Sparkles },
            { id: 'posts' as const, label: 'Posts', icon: ListChecks },
            { id: 'scheduler' as const, label: 'Scheduler', icon: Clock },
            { id: 'logs' as const, label: 'Logs', icon: Calendar },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {genResult && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                genResult.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {genResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span className="break-words">{genResult.message}</span>
              <button onClick={() => setGenResult(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">
                dismiss
              </button>
            </div>
          )}

          {/* Generate */}
          {tab === 'generate' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold mb-1">Generate a new blog post now</h3>
                <p className="text-sm text-muted-foreground">
                  Leave keyword empty to auto-pick the next best keyword from the seed bank.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom keyword (optional)</label>
                  <input
                    type="text"
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    placeholder="e.g. how to sell ebooks in Uganda"
                    className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background"
                  >
                    <option value="">Auto-pick</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  {generating ? 'Generating… (30-90s)' : 'Generate Post'}
                </button>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 border px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Seed keyword bank
                </button>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg">
                Each generation takes ~30-90 seconds (AI writes 1500-2500 words + generates cover image).
                The post is published immediately and appears on the homepage + sitemap.
              </div>
            </div>
          )}

          {/* Posts */}
          {tab === 'posts' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">All posts ({posts.length})</h3>
                <button onClick={loadPosts} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No posts yet. Go to the <strong>Generate</strong> tab to create your first one.
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {posts.map((p) => (
                    <div key={p.id} className="border rounded-lg p-3 hover:bg-muted/30 transition">
                      <div className="flex items-start gap-3">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                            {p.category[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={`/post/${p.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="font-medium text-sm hover:underline line-clamp-1"
                          >
                            {p.title}
                          </a>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                            <span className="px-1.5 py-0.5 rounded bg-muted">{p.category}</span>
                            <span>{p.wordCount.toLocaleString()} words</span>
                            <span>{p.readingTime} min</span>
                            <span>{new Date(p.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            <span className="font-medium">Focus:</span> {p.focusKeyword}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scheduler */}
          {tab === 'scheduler' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold mb-1">Auto-post scheduler</h3>
                <p className="text-sm text-muted-foreground">
                  The scheduler runs as a node-cron task inside the Next.js server. It picks one keyword
                  per run and auto-generates + publishes a post. Timezone: Africa/Kampala.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Status</div>
                  <div className="text-lg font-bold mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${scheduler?.status?.running ? 'bg-green-500' : 'bg-red-500'}`} />
                    {scheduler?.status?.running ? 'Running' : 'Stopped'}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Current schedule</div>
                  <div className="text-lg font-bold mt-1 font-mono">{scheduler?.schedule || '—'}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Paused</div>
                  <div className="text-lg font-bold mt-1">{scheduler?.paused ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cron schedule</label>
                  <input
                    type="text"
                    value={scheduleInput}
                    onChange={(e) => setScheduleInput(e.target.value)}
                    placeholder="0 8 * * *"
                    className="mt-1 w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: minute hour day-of-month month day-of-week. Examples:
                    <code className="ml-1 px-1 bg-muted rounded">0 8 * * *</code> daily 8am,
                    <code className="ml-1 px-1 bg-muted rounded">0 8,20 * * *</code> twice daily,
                    <code className="ml-1 px-1 bg-muted rounded">0 8 * * 1,4</code> Mon & Thu.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSchedulerAction('start', { schedule: scheduleInput })}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    <Play className="w-4 h-4" /> Start
                  </button>
                  <button
                    onClick={() => handleSchedulerAction('stop')}
                    className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    <Pause className="w-4 h-4" /> Stop
                  </button>
                  <button
                    onClick={() => handleSchedulerAction('run-now')}
                    className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    <Rocket className="w-4 h-4" /> Run now (async)
                  </button>
                  <button
                    onClick={() => handleSchedulerAction('set-schedule', { schedule: scheduleInput })}
                    className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" /> Save schedule
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg">
                <strong>Note:</strong> The scheduler auto-starts when the server boots if the pause flag is not set.
                Use Stop to pause indefinitely. Use Run now to trigger a one-off generation without waiting for the cron.
              </div>
            </div>
          )}

          {/* Logs */}
          {tab === 'logs' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Recent activity</h3>
                <button onClick={loadScheduler} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              {scheduler?.recentLogs?.length ? (
                <div className="space-y-2">
                  {scheduler.recentLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            log.action === 'published'
                              ? 'bg-green-100 text-green-700'
                              : log.action === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-foreground/70 break-words">
                        {log.message || (log.postSlug ? `slug=${log.postSlug}` : '—')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">No activity yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
