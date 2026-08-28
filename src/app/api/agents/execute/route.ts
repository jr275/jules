import { NextResponse } from 'next/server';
import { AgentRuntimeEngine } from '@/lib/domain/engine';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = 'tenant-northstar-001';
    const organizationId = 'org-northstar-holdings';

    const { agentId = 'agent-cash-flow', inputPrompt, autonomyLevel = 'LEVEL_2_PREPARE' } = body;

    const runtimeResult = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId,
      taskPrompt: inputPrompt || 'Analyze liquidity reserve and optimize $2,500,000 idle cash balance',
      autonomyLevel,
      maxIterations: 5,
    });

    // Fetch full execution details including persisted steps and output
    const execution = await prisma.execution.findUnique({
      where: { id: runtimeResult.executionId },
      include: {
        steps: { orderBy: { createdAt: 'asc' } },
        outputs: { include: { provenance: true } },
      },
    });

    return NextResponse.json({
      success: true,
      execution,
      steps: execution?.steps || [],
      businessOutput: execution?.outputs[0] || null,
      events: runtimeResult.events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
