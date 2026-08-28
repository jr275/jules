import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Metric } from '@/components/ui/Metric';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100">{agent.name}</h1>
            <Badge variant="info">v{agent.version}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">{agent.description}</p>
        </div>
        <Status type={agent.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Success Rate" value="100%" isPositive={true} subtext="Across all executions" />
        <Metric label="Economic Impact" value={`$${agent.outputs.reduce((a, b) => a + (b.financialImpact || 0), 0).toLocaleString()} USD`} isPositive={true} subtext="Net value created" />
        <Metric label="Autonomy Level" value={agent.autonomyLevel} subtext="CFO Threshold Policy Enforced" />
        <Metric label="Knowledge Sources" value={`${agent.agentKnowledge.length} Connected`} subtext="Google Sheets & Bank APIs" />
      </div>

      <Card title="Agent Specification & Connected Systems">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-[#111622] border border-[#1e2738] rounded">
            <span className="text-slate-500 uppercase block mb-1">Skills</span>
            <div className="space-y-1">
              {agent.agentSkills.map(({ skill }) => (
                <div key={skill.id} className="text-slate-200 font-semibold">{skill.name}</div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-[#111622] border border-[#1e2738] rounded">
            <span className="text-slate-500 uppercase block mb-1">Connectors</span>
            <div className="space-y-1">
              {agent.agentConnectors.map(({ connector }) => (
                <div key={connector.id} className="text-blue-400 font-semibold">{connector.name}</div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-[#111622] border border-[#1e2738] rounded">
            <span className="text-slate-500 uppercase block mb-1">Knowledge Sources</span>
            <div className="space-y-1">
              {agent.agentKnowledge.map(({ knowledgeSource }) => (
                <div key={knowledgeSource.id} className="text-emerald-400 font-semibold">{knowledgeSource.name}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Agent Output History & Provenance">
        <Table
          headers={['Type', 'Summary', 'Impact', 'Source Provenance', 'Confidence']}
          rows={agent.outputs.map((o) => [
            <Badge key="t" variant="info">{o.type}</Badge>,
            o.summary,
            <span key="imp" className="font-mono text-emerald-400">+${o.financialImpact.toLocaleString()}</span>,
            <span key="src" className="font-mono text-slate-400 text-xs">{o.source}</span>,
            <span key="conf" className="font-mono">{Math.round(o.confidence * 100)}%</span>,
          ])}
        />
      </Card>
    </div>
  );
}
