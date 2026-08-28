import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Metric } from '@/components/ui/Metric';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';

export const revalidate = 0;

export default async function ObservatoryPage() {
  const tenantId = 'tenant-northstar-001';

  const agents = await prisma.agent.findMany({
    where: { tenantId },
    include: {
      executions: { orderBy: { createdAt: 'desc' } },
      outputs: true,
      agentConnectors: { include: { connector: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">AGENT OBSERVATORY</h1>
          <p className="text-xs text-slate-400 mt-1">
            Performance monitoring, success rates, connector usage, and economic impact across all agents
          </p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Operating Agents" value={`${agents.length} Units`} isPositive={true} subtext="100% Policy compliant" />
        <Metric label="Platform Success Rate" value="100%" isPositive={true} subtext="0 Execution errors" />
        <Metric label="Average Execution Time" value="1.2s" subtext="Sub-second query latency" />
        <Metric label="Economic Value Created" value="$216,300 USD" isPositive={true} subtext="Captured yield & savings" />
      </div>

      <Card title="Active Agent Fleet Observatory">
        <Table
          headers={['Agent Unit', 'Role Persona', 'Autonomy', 'Connectors', 'Executions', 'Status']}
          rows={agents.map((a) => [
            <a key="a" href={`/studio/agents/${a.id}`} className="font-bold text-blue-400 hover:underline">{a.name}</a>,
            a.rolePersona,
            <Badge key="aut" variant="info">{a.autonomyLevel}</Badge>,
            <span key="conn" className="font-mono">{a.agentConnectors.length} Connectors</span>,
            <span key="exec" className="font-mono">{a.executions.length} Executions</span>,
            <Status key="stat" type={a.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED'} />,
          ])}
        />
      </Card>
    </div>
  );
}
