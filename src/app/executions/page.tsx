import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';

export const revalidate = 0;

export default async function ExecutionsPage() {
  const tenantId = 'tenant-northstar-001';
  const executions = await prisma.execution.findMany({
    where: { tenantId },
    include: { worker: true, steps: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">EXECUTION AUDIT ENGINE</h1>
          <p className="text-xs text-slate-400 mt-1">Step-by-step pipeline executions and technical telemetry</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Worker Execution Pipeline Logs">
        <Table
          headers={['Execution ID', 'Worker Unit', 'Trigger', 'Status', 'Steps Completed', 'Executed At']}
          rows={executions.map((r) => [
            <span key="id" className="font-mono text-xs">{r.id}</span>,
            <span key="wrk" className="font-semibold text-slate-200">{r.worker?.name || 'Worker'}</span>,
            <Badge key="trig" variant="neutral">{r.trigger}</Badge>,
            <Status key="stat" type={r.status as any} />,
            <span key="steps" className="font-mono">{r.steps?.length || 0} Steps</span>,
            <span key="time" className="font-mono text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>,
          ])}
        />
      </Card>
    </div>
  );
}
