/**
 * Background scheduler that auto-generates blog posts on a cron schedule.
 *
 * Uses node-cron (works in Next.js long-running dev/prod server process).
 * Schedule is configurable in admin dashboard; defaults to daily at 08:00.
 *
 * IMPORTANT: This module is lazy-initialized when first imported server-side
 * (e.g., from the admin route). In a serverless deployment you'd want
 * to move this to a worker, but for the Next.js dev server it works fine.
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
 */
export async function initSchedulerIfEnabled() {
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
