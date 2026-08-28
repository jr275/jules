import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function AuditSettingsPage() {
  const tenantId = 'tenant-northstar-001';
  const auditEvents = await prisma.auditEvent.findMany({
    where: { tenantId },
    orderBy: { timestamp: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">IMMUTABLE AUDIT TRAIL</h1>
          <p className="text-xs text-slate-400 mt-1">Complete governance audit log of worker, policy, decision, and approval events</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="System Audit Records">
        <Table
          headers={['Event Type', 'Actor', 'Resource', 'Resource ID', 'Timestamp']}
          rows={auditEvents.map((r) => [
            <Badge key="ev" variant="info">{r.event}</Badge>,
            <span key="act" className="font-mono text-xs">{r.actor}</span>,
            <span key="res" className="font-semibold text-slate-200">{r.resource}</span>,
            <span key="resid" className="font-mono text-slate-500">{r.resourceId}</span>,
            <span key="time" className="font-mono text-slate-500">{new Date(r.timestamp).toLocaleString()}</span>,
          ])}
        />
      </Card>
    </div>
  );
}
