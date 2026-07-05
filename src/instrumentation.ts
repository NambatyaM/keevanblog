/**
 * Next.js instrumentation hook — runs once when the server boots.
 * Used to start the auto-blog scheduler.
 */
export async function register() {
  // Only run on server
  if (typeof window !== 'undefined') return;

  try {
    const { initSchedulerIfEnabled } = await import('@/lib/scheduler');
    await initSchedulerIfEnabled();
  } catch (err) {
    console.error('[instrumentation] scheduler init failed:', err);
  }
}
