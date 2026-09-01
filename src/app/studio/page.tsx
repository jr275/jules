import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Cpu, Plus, Layers, ShieldCheck, Play } from 'lucide-react';

export const revalidate = 0;

export default async function StudioOverviewPage() {
  const tenantId = 'tenant-northstar-001';

  const agents = await prisma.agent.findMany({
    where: { tenantId },
    include: {
      agentSkills: { include: { skill: true } },
      agentTools: { include: { tool: true } },
      agentConnectors: { include: { connector: true } },
      executions: { orderBy: { createdAt: 'desc' }, take: 3 },
      outputs: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const workers = await prisma.worker.findMany({
    where: { tenantId },
    include: {
      workerSkills: { include: { skill: true } },
      executions: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            FINANCIAL AI AGENT STUDIO & FLEET
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Build, configure, simulate, and deploy autonomous financial agents under deterministic policy rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
          <Link href="/studio/agents/new">
            <Button variant="primary" className="gap-2 font-mono text-xs">
              <Plus className="w-3.5 h-3.5" />
              Build New Financial AI Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Deployed Active Agents */}
      <Card title={`Active Financial Agents (${agents.length} Deployed)`}>
        <Table
          headers={['Agent Unit', 'Role Persona', 'Autonomy Level', 'Skills', 'Tools', 'Economic Impact', 'Actions']}
          rows={agents.map((agent) => [
            <Link key="name" href={`/studio/agents/${agent.id}`} className="font-bold text-slate-100 hover:text-blue-400 font-mono text-xs flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              {agent.name}
            </Link>,
            <span key="role" className="font-mono text-xs text-slate-300">{agent.rolePersona}</span>,
            <Badge key="aut" variant="info">{agent.autonomyLevel}</Badge>,
            <span key="skills" className="font-mono text-xs text-slate-300">{agent.agentSkills.length} Active</span>,
            <span key="tools" className="font-mono text-xs text-slate-300">{agent.agentTools.length} Connected</span>,
            <span key="imp" className="font-mono text-emerald-400 font-bold">
              +${agent.outputs.reduce((a, b) => a + (b.financialImpact || 0), 0).toLocaleString()} USD
            </span>,
            <div key="act" className="flex items-center gap-2">
              <Link href={`/studio/agents/${agent.id}`}>
                <Button size="sm" variant="primary" className="font-mono text-[11px] gap-1">
                  <Play className="w-3 h-3" /> Test Lab
                </Button>
              </Link>
            </div>,
          ])}
        />
      </Card>

      {/* Autonomous Operating Workers */}
      <Card title={`Autonomous Financial Workers (${workers.length} Units)`}>
        <Table
          headers={['Worker Identity', 'Purpose', 'Autonomy Level', 'Skills Enabled', 'Status']}
          rows={workers.map((worker) => [
            <span key="wname" className="font-bold text-slate-200 font-mono text-xs">{worker.name}</span>,
            <span key="purp" className="text-slate-400 text-xs">{worker.purpose}</span>,
            <Badge key="waut" variant="neutral">{worker.autonomyLevel}</Badge>,
            <span key="wsk" className="font-mono text-xs text-slate-300">{worker.workerSkills.length} Skills</span>,
            <Status key="wstat" type={worker.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED'} />,
          ])}
        />
      </Card>
    </div>
  );
}
