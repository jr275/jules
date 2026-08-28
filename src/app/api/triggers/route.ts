import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AgentSchedulerService } from '@/lib/domain/scheduler';

export async function GET() {
  try {
    const tenantId = 'tenant-northstar-001';
    const triggers = await prisma.agentTrigger.findMany({
      where: { tenantId },
      include: { agent: true, occurrences: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, triggers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch triggers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = 'tenant-northstar-001';
    const body = await request.json();

    const { agentId, type, cronExpression, timezone, misfirePolicy, configuration } = body;

    if (!agentId || !type) {
      return NextResponse.json(
        { success: false, error: 'agentId and type are required' },
        { status: 400 }
      );
    }

    const trigger = await AgentSchedulerService.createTrigger({
      tenantId,
      agentId,
      type,
      cronExpression,
      timezone,
      misfirePolicy,
      configuration,
    });

    return NextResponse.json({ success: true, trigger });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create trigger' },
      { status: 500 }
    );
  }
}
