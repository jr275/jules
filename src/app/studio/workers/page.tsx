import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Card, Badge, Button, Input, Select } from '@/components/ui/design-system';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function WorkersConfigPage() {
  const workers = await prisma.worker.findMany({
    include: { workerSkills: { include: { skill: true } } },
  });
  const policies = await prisma.policy.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/studio" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Worker Configuration Builder</h1>
            <p className="text-xs text-slate-400">Specify Identity, Purpose, Autonomy Boundaries, Policies & Tools</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5">
          <Save className="h-4 w-4" /> Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Worker Specification">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Worker Name</label>
                <Input defaultValue={workers[0]?.name || 'Cash Optimization Worker'} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Purpose & Mission</label>
                <Input defaultValue={workers[0]?.purpose || 'Maximize interest yields and release working capital'} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Autonomy Level</label>
                <Select defaultValue={workers[0]?.autonomyLevel || 'LEVEL_2_PREPARE'}>
                  <option value="LEVEL_0_OBSERVE">LEVEL_0_OBSERVE — Passive Monitoring Only</option>
                  <option value="LEVEL_1_RECOMMEND">LEVEL_1_RECOMMEND — Generate Recommendations</option>
                  <option value="LEVEL_2_PREPARE">LEVEL_2_PREPARE — Draft Executions for Review</option>
                  <option value="LEVEL_3_EXECUTE_WITHIN_POLICY">LEVEL_3_EXECUTE_WITHIN_POLICY — Execute directly if policy matches</option>
                  <option value="LEVEL_4_AUTONOMOUS_OPTIMIZATION">LEVEL_4_AUTONOMOUS_OPTIMIZATION — Full Autonomous Optimization</option>
                </Select>
              </div>
            </div>
          </Panel>
        </div>

        <div>
          <Panel title="Associated Governance Policies">
            <div className="space-y-3">
              {policies.map((p) => (
                <Card key={p.id} className="p-3 bg-slate-950">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                    <Badge variant="success">{p.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.description}</p>
                </Card>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
