import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';

export const revalidate = 0;

export default async function WorkerStudioPage() {
  const tenantId = 'tenant-northstar-001';

  const workers = await prisma.worker.findMany({
    where: { tenantId },
    include: {
      workerSkills: {
        include: { skill: true },
      },
      executions: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">WORKER STUDIO</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure, manage, and inspect autonomous financial operating units
          </p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {workers.map((worker) => (
          <Card
            key={worker.id}
            title={worker.name}
            subtitle={worker.purpose}
            action={<Status type={worker.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED'} />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-[#111622] rounded border border-[#1e2738] text-xs font-mono">
                <div>
                  <span className="text-slate-500 block uppercase">Identity ID</span>
                  <span className="text-slate-200 font-semibold">{worker.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Autonomy Level</span>
                  <span className="text-blue-400 font-semibold">{worker.autonomyLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Assigned Skills</span>
                  <span className="text-slate-200 font-semibold">{worker.workerSkills.length} Skills</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Execution Policy</span>
                  <span className="text-emerald-400 font-semibold">CFO Threshold Enforced</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Enabled Skills & Capabilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {worker.workerSkills.map(({ skill }) => (
                    <div key={skill.id} className="p-3 bg-[#111622] border border-[#1e2738] rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 text-xs">{skill.name}</span>
                        <Badge variant="info">{skill.category}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
                      <div className="mt-2 text-[11px] font-mono text-slate-500 flex justify-between">
                        <span>Risk Level: {skill.riskLevel}</span>
                        <span>Autonomy: {skill.autonomyLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Recent Executions
                </h4>
                <Table
                  headers={['Execution ID', 'Trigger', 'Status', 'Timestamp']}
                  rows={worker.executions.map((r) => [
                    <span key="id" className="font-mono text-xs">{r.id}</span>,
                    <Badge key="trig" variant="neutral">{r.trigger}</Badge>,
                    <Status key="stat" type={r.status as any} />,
                    <span key="time" className="font-mono text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>,
                  ])}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
