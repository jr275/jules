import { NextResponse } from 'next/server';
import { AgentSchedulerService } from '@/lib/domain/scheduler';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantId = 'tenant-northstar-001';

    const jobId = await AgentSchedulerService.runNow(tenantId, resolvedParams.id);
    return NextResponse.json({ success: true, jobId, message: 'Trigger manual run-now queued successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Run now failed' },
      { status: 500 }
    );
  }
}
