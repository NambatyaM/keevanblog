/**
 * Next.js instrumentation hook — runs once when the server boots.
 * Validates required env vars and starts the scheduler.
 */
export async function register() {
  if (typeof window !== 'undefined') return;

  // Validate required env vars at startup
  const required = ['DATABASE_URL', 'ZAI_API_KEY'] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[instrumentation] Missing required env vars: ${missing.join(', ')}`);
  }

  try {
    const { initSchedulerIfEnabled } = await import('@/lib/scheduler');
    await initSchedulerIfEnabled();
  } catch (err) {
    console.error('[instrumentation] scheduler init failed:', err);
  }
}
