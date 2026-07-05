/**
 * API: Scheduler control
 * GET  /api/admin/scheduler — current status
 * POST /api/admin/scheduler { action: 'start'|'stop'|'run-now'|'set-schedule', schedule?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  runScheduledGeneration,
} from '@/lib/scheduler';
import { SCHEDULER } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const scheduleSetting = await db.setting.findUnique({ where: { key: 'scheduler.schedule' } });
  const pausedSetting = await db.setting.findUnique({ where: { key: 'scheduler.paused' } });
  const recentLogs = await db.scheduleLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return NextResponse.json({
    status: getSchedulerStatus(),
    schedule: scheduleSetting?.value || SCHEDULER.cronSchedule,
    paused: pausedSetting?.value === 'true',
    recentLogs,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'start') {
      await db.setting.upsert({
        where: { key: 'scheduler.paused' },
        create: { key: 'scheduler.paused', value: 'false' },
        update: { value: 'false' },
      });
      const schedule = body.schedule || SCHEDULER.cronSchedule;
      await db.setting.upsert({
        where: { key: 'scheduler.schedule' },
        create: { key: 'scheduler.schedule', value: schedule },
        update: { value: schedule },
      });
      await startScheduler(schedule);
      return NextResponse.json({ success: true, status: getSchedulerStatus() });
    }

    if (action === 'stop') {
      stopScheduler();
      await db.setting.upsert({
        where: { key: 'scheduler.paused' },
        create: { key: 'scheduler.paused', value: 'true' },
        update: { value: 'true' },
      });
      return NextResponse.json({ success: true, status: getSchedulerStatus() });
    }

    if (action === 'run-now') {
      // Fire async — don't block the request
      runScheduledGeneration().catch((e) => console.error('[run-now]', e));
      return NextResponse.json({ success: true, message: 'generation triggered' });
    }

    if (action === 'set-schedule') {
      const schedule = body.schedule;
      if (!schedule) return NextResponse.json({ error: 'schedule required' }, { status: 400 });
      await db.setting.upsert({
        where: { key: 'scheduler.schedule' },
        create: { key: 'scheduler.schedule', value: schedule },
        update: { value: schedule },
      });
      await startScheduler(schedule);
      return NextResponse.json({ success: true, status: getSchedulerStatus() });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'error' }, { status: 500 });
  }
}
