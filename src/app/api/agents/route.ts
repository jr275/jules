import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tenantId = 'tenant-northstar-001';
    const agents = await prisma.agent.findMany({
      where: { tenantId },
      include: {
        agentSkills: { include: { skill: true } },
        agentTools: { include: { tool: true } },
        agentConnectors: { include: { connector: true } },
        agentKnowledge: { include: { knowledgeSource: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ success: true, agents });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = 'tenant-northstar-001';
    const organizationId = 'org-northstar-holdings';

    const {
      name,
      description,
      objective,
      rolePersona,
      instructions,
      autonomyLevel,
      skills = [],
      tools = [],
    } = body;

    if (!name || !objective) {
      return NextResponse.json(
        { success: false, error: 'Agent name and objective are required' },
        { status: 400 }
      );
    }

    const newAgent = await prisma.agent.create({
      data: {
        tenantId,
        organizationId,
        name,
        description: description || 'Autonomous Financial AI Agent',
        objective,
        rolePersona: rolePersona || 'Treasury AI Specialist',
        instructions: instructions || objective,
        autonomyLevel: autonomyLevel || 'LEVEL_2_PREPARE',
        status: 'ACTIVE',
        version: 1,
      },
    });

    // Create AgentVersion record
    await prisma.agentVersion.create({
      data: {
        agentId: newAgent.id,
        version: 1,
        configuration: JSON.stringify({ name, objective, autonomyLevel, skills, tools }),
        changelog: 'Initial agent configuration & deployment',
      },
    });

    // Link available skills if matched
    const dbSkills = await prisma.skill.findMany({
      where: { name: { in: skills } },
    });
    if (dbSkills.length > 0) {
      await prisma.agentSkill.createMany({
        data: dbSkills.map((s) => ({
          agentId: newAgent.id,
          skillId: s.id,
        })),
      });
    }

    // Link available tools if matched
    const dbTools = await prisma.tool.findMany({
      where: { name: { in: tools } },
    });
    if (dbTools.length > 0) {
      await prisma.agentTool.createMany({
        data: dbTools.map((t) => ({
          agentId: newAgent.id,
          toolId: t.id,
        })),
      });
    }

    return NextResponse.json({ success: true, agent: newAgent });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}
