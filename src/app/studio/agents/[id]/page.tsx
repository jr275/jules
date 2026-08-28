import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Metric } from '@/components/ui/Metric';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';
import { AgentBuilder } from '@/components/agent/AgentBuilder';
import { AgentTestLab } from '@/components/agent/AgentTestLab';
import { Cpu, Terminal, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tenantId = 'tenant-northstar-001';

  const agent = await prisma.agent.findFirst({
    where: { id: resolvedParams.id, tenantId },
    include: {
      agentSkills: { include: { skill: true } },
      agentTools: { include: { tool: true } },
      agentConnectors: { include: { connector: true } },
      agentKnowledge: { include: { knowledgeSource: true } },
      executions: { orderBy: { createdAt: 'desc' }, take: 5 },
      outputs: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!agent) {
    return <div className="p-8 text-slate-400 font-mono text-xs">Agent not found.</div>;
  }

  const skillNames = agent.agentSkills.map((s) => s.skill.name);
  const toolNames = agent.agentTools.map((t) => t.tool.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              {agent.name}
            </h1>
            <Badge variant="info">v{agent.version}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">{agent.description}</p>
        </div>
        <Status type={agent.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Success Rate" value="100%" isPositive={true} subtext="Across all executions" />
        <Metric
          label="Economic Impact"
          value={`$${agent.outputs.reduce((a, b) => a + (b.financialImpact || 0), 0).toLocaleString()} USD`}
          isPositive={true}
          subtext="Net value created"
        />
        <Metric label="Autonomy Level" value={agent.autonomyLevel} subtext="CFO Threshold Policy Enforced" />
        <Metric label="Knowledge Sources" value={`${agent.agentKnowledge.length} Connected`} subtext="Google Sheets & Bank APIs" />
      </div>

      <div className="space-y-6">
        <Card title="Agent Test Lab — Execution Engine">
          <AgentTestLab
            agentId={agent.id}
            initialConfig={{
              name: agent.name,
              objective: agent.objective,
              skills: skillNames,
              tools: toolNames,
              autonomyLevel: agent.autonomyLevel,
            }}
          />
        </Card>

        <Card title="Agent Specification & Configuration Matrix">
          <AgentBuilder
            initialAgent={{
              id: agent.id,
              name: agent.name,
              description: agent.description,
              objective: agent.objective,
              rolePersona: agent.rolePersona,
              autonomyLevel: agent.autonomyLevel,
              skills: skillNames,
              tools: toolNames,
            }}
          />
        </Card>

        <Card title="Recorded Execution History & Output Log">
          <Table
            headers={['Type', 'Summary', 'Financial Impact', 'Source Provenance', 'Confidence Score']}
            rows={agent.outputs.map((o) => [
              <Badge key="t" variant="info">{o.type}</Badge>,
              o.summary,
              <span key="imp" className="font-mono text-emerald-400 font-bold">+${o.financialImpact.toLocaleString()} USD</span>,
              <span key="src" className="font-mono text-slate-400 text-xs">{o.source}</span>,
              <span key="conf" className="font-mono font-bold">{Math.round(o.confidence * 100)}%</span>,
            ])}
          />
        </Card>
      </div>
    </div>
  );
}
