import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantId = 'tenant-northstar-001';

    const agent = await prisma.agent.findFirst({
      where: { id: resolvedParams.id, tenantId },
      include: {
        agentSkills: { include: { skill: true } },
        agentTools: { include: { tool: true } },
        agentConnectors: { include: { connector: true } },
        agentKnowledge: { include: { knowledgeSource: true } },
        executions: { orderBy: { createdAt: 'desc' }, take: 10 },
        outputs: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantId = 'tenant-northstar-001';
    const body = await request.json();

    const existing = await prisma.agent.findFirst({
      where: { id: resolvedParams.id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const {
      name,
      description,
      objective,
      rolePersona,
      instructions,
      autonomyLevel,
      status,
    } = body;

    const newVersion = existing.version + 1;

    const updatedAgent = await prisma.agent.update({
      where: { id: existing.id },
      data: {
        name: name || existing.name,
        description: description || existing.description,
        objective: objective || existing.objective,
        rolePersona: rolePersona || existing.rolePersona,
        instructions: instructions || existing.instructions,
        autonomyLevel: autonomyLevel || existing.autonomyLevel,
        status: status || existing.status,
        version: newVersion,
      },
    });

    await prisma.agentVersion.create({
      data: {
        agentId: updatedAgent.id,
        version: newVersion,
        configuration: JSON.stringify(body),
        changelog: `Updated agent to version ${newVersion}`,
      },
    });

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update agent' },
      { status: 500 }
    );
  }
}
