'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

type PostSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  focusKeyword: string;
  wordCount: number;
  readingTime: number;
  status: string;
  publishedAt: string;
};

type PostPage = {
  posts: PostSummary[];
  total: number;
  limit: number;
  offset: number;
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [postPage, setPostPage] = useState<PostPage | null>(null);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const PAGE_SIZE = 20;

  const loadPosts = useCallback(() => {
    fetch(`/api/admin/posts?status=${statusFilter}&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`)
      .then((r) => r.json())
      .then(setPostPage)
      .catch(() => {});
  }, [statusFilter, page]);

  const loadScheduler = useCallback(() => {
    fetch('/api/admin/scheduler')
      .then((r) => r.json())
      .then(setSchedulerStatus)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    loadScheduler();
    loadPosts();
  }, [loadScheduler, loadPosts]);

  const deletePost = (id: string, title: string) => {
    if (deleting) return;
    if (!confirm(`Delete "${title}"?\n\nThis action cannot be undone.`)) return;
    setDeleting(id);
    setMessage(null);
    fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { loadPosts(); setMessage({ type: 'success', text: `Deleted: ${title}` }); }
        else setMessage({ type: 'error', text: `Delete failed: ${d.error}` });
      })
      .catch(() => setMessage({ type: 'error', text: 'Delete failed - network error' }))
      .finally(() => setDeleting(null));
  };

  const generatePost = () => {
    if (generating) return;
    setGenerating(true);
    setMessage(null);
    setMessage({ type: 'success', text: 'Generating post... (up to 60s)' });
    fetch('/api/admin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.post) {
          setMessage({ type: 'success', text: `Published: "${d.post.title}" → /post/${d.post.slug}` });
          loadPosts();
          loadScheduler();
        } else {
          setMessage({ type: 'error', text: d.error || 'Generation failed' });
        }
      })
      .catch(() => setMessage({ type: 'error', text: 'Generation request failed' }))
      .finally(() => setGenerating(false));
  };

  if (status !== 'authenticated') return null;

  const totalPages = postPage ? Math.ceil(postPage.total / PAGE_SIZE) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Signed in as {session.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          Sign out
        </button>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 text-xs opacity-60 hover:opacity-100">dismiss</button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Scheduler</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Status</dt>
              <dd>{schedulerStatus?.status?.running ? 'Running' : 'Stopped'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Schedule</dt>
              <dd>{schedulerStatus?.schedule || 'Not set'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Paused</dt>
              <dd>{schedulerStatus?.paused ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() =>
                fetch('/api/admin/scheduler', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'run-now' }),
                }).then(() => { loadPosts(); loadScheduler(); })
              }
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Run now
            </button>
            <button
              onClick={() =>
                fetch('/api/admin/scheduler', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'start' }),
                }).then(() => loadScheduler())
              }
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              Start
            </button>
            <button
              onClick={() =>
                fetch('/api/admin/scheduler', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'stop' }),
                }).then(() => loadScheduler())
              }
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Recent Logs</h2>
          <div className="mt-4 max-h-48 space-y-1 overflow-y-auto text-xs">
            {schedulerStatus?.recentLogs?.length === 0 && (
              <p className="text-muted-foreground">No logs yet.</p>
            )}
            {schedulerStatus?.recentLogs?.map((log: any) => (
              <div key={log.id} className="flex justify-between text-muted-foreground">
                <span className={log.action === 'failed' ? 'text-red-500' : ''}>{log.action}{log.postSlug ? `: ${log.postSlug}` : ''}</span>
                <span>{log.createdAt?.slice(0, 16)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Posts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {postPage ? `${postPage.total} total` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={generatePost}
              disabled={generating}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate one post'}
            </button>
          </div>
        </div>

        {postPage && postPage.posts.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No posts found.</p>
        )}

        {postPage && postPage.posts.length > 0 && (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 pr-4 font-medium">Keyword</th>
                    <th className="pb-2 pr-4 font-medium">Category</th>
                    <th className="pb-2 pr-4 font-medium text-right">Words</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postPage.posts.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pr-4">
                        <a
                          href={`/post/${p.slug}`}
                          className="font-medium text-primary hover:underline"
                          target="_blank"
                        >
                          {p.title}
                        </a>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{p.focusKeyword}</td>
                      <td className="py-2 pr-4 text-muted-foreground capitalize">{p.category}</td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">{p.wordCount}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(p.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => deletePost(p.id, p.title)}
                          disabled={deleting === p.id}
                          className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/20 disabled:opacity-30"
                        >
                          {deleting === p.id ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
