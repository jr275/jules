import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DurableJobQueue } from '@/lib/domain/queue';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = 'tenant-northstar-001';
    const organizationId = 'org-northstar-holdings';

    const { agentId = 'agent-cash-flow', inputPrompt, autonomyLevel = 'LEVEL_2_PREPARE', priority = 'NORMAL' } = body;

    const agent = await prisma.agent.findFirst({
      where: { id: agentId, tenantId },
    });

    // 1. Create Persistent Execution Record
    const dbExecution = await prisma.execution.create({
      data: {
        tenantId,
        organizationId,
        agentId: agent ? agent.id : null,
        trigger: 'ASYNC_JOB_QUEUE',
        status: 'QUEUED',
        startedAt: new Date(),
      },
    });

    // 2. Enqueue Background Durable Job
    const job = await DurableJobQueue.enqueueJob({
      tenantId,
      agentId: agent ? agent.id : agentId,
      executionId: dbExecution.id,
      priority: priority as any,
      metadata: {
        taskPrompt: inputPrompt || 'Analyze liquidity reserve and optimize $2,500,000 idle cash balance',
        autonomyLevel,
      },
    });

    // 3. Return Immediately without blocking the HTTP request
    return NextResponse.json({
      success: true,
      message: 'Agent execution job enqueued successfully',
      jobId: job.id,
      executionId: dbExecution.id,
      status: 'QUEUED',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Execution queueing failed' },
      { status: 500 }
    );
  }
}
