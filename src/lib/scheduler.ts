/**
 * Background scheduler that auto-generates blog posts on a cron schedule.
 *
 * TWO MODES:
 *  - DEV (this sandbox / `next dev`): uses node-cron to run on a schedule
 *  - PROD (Vercel): NOT used — Vercel Cron Jobs triggers /api/admin/generate
 *    instead, because Vercel serverless functions don't have a long-running
 *    process. The `vercel.json` file at project root configures the cron.
 *
 * On Vercel, `initSchedulerIfEnabled()` is a no-op (the instrumentation hook
 * still calls it, but it returns early when `VERCEL=1` is set).
 */

import cron from 'node-cron';
import { db } from '@/lib/db';
import { pickNextKeyword, generateAndStorePost } from '@/lib/ai-engine';
import { SCHEDULER } from '@/lib/site-config';

let cronTask: cron.ScheduledTask | null = null;
let currentSchedule: string | null = null;

export function getSchedulerStatus() {
  return {
    running: cronTask !== null,
    schedule: currentSchedule,
    paused: cronTask === null,
  };
}

export async function startScheduler(schedule: string = SCHEDULER.cronSchedule) {
  if (cronTask && currentSchedule === schedule) return getSchedulerStatus();
  stopScheduler();

  if (!cron.validate(schedule)) {
    throw new Error(`Invalid cron schedule: ${schedule}`);
  }

  cronTask = cron.schedule(
    schedule,
    async () => {
      await runScheduledGeneration();
    },
    { timezone: 'Africa/Kampala' }
  );
  currentSchedule = schedule;
  console.log(`[scheduler] started with schedule: ${schedule} (Africa/Kampala)`);
  return getSchedulerStatus();
}

export function stopScheduler() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    currentSchedule = null;
    console.log('[scheduler] stopped');
  }
  return getSchedulerStatus();
}

export async function runScheduledGeneration() {
  try {
    console.log('[scheduler] running scheduled generation at', new Date().toISOString());

    // Check pause flag in DB
    const pauseSetting = await db.setting.findUnique({ where: { key: 'scheduler.paused' } });
    if (pauseSetting?.value === 'true') {
      console.log('[scheduler] paused via setting — skipping run');
      await db.scheduleLog.create({ data: { action: 'skipped', message: 'scheduler paused' } });
      return;
    }

    const pick = await pickNextKeyword();
    if (!pick) {
      console.log('[scheduler] no keyword available — skipping');
      return;
    }

    console.log('[scheduler] picked keyword:', pick.keyword);
    const result = await generateAndStorePost({ keyword: pick.keyword, category: pick.category });

    if (result.post) {
      console.log('[scheduler] published:', result.post.slug);
    } else {
      console.error('[scheduler] failed:', result.error);
    }
  } catch (err: any) {
    console.error('[scheduler] top-level error:', err?.message || err);
  }
}

/**
 * Initialize scheduler on server boot. Safe to call multiple times.
 *
 * On Vercel (production), this is a no-op — Vercel Cron Jobs handle the
 * scheduling by hitting /api/admin/generate on a schedule defined in
 * vercel.json. node-cron can't run on Vercel because there's no
 * long-running process.
 */
export async function initSchedulerIfEnabled() {
  // No-op on Vercel — cron is handled by vercel.json + /api/admin/generate GET handler
  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    console.log('[scheduler] Vercel environment detected — cron handled by Vercel Cron Jobs');
    return;
  }

  try {
    const pausedSetting = await db.setting.findUnique({ where: { key: 'scheduler.paused' } });
    const paused = pausedSetting?.value === 'true';
    if (paused) {
      console.log('[scheduler] init skipped — paused flag set');
      return;
    }
    const scheduleSetting = await db.setting.findUnique({ where: { key: 'scheduler.schedule' } });
    const schedule = scheduleSetting?.value || SCHEDULER.cronSchedule;
    await startScheduler(schedule);
  } catch (err) {
    console.error('[scheduler] init failed:', err);
  }
}
