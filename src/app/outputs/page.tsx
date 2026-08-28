import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function OutputsCenterPage() {
  const tenantId = 'tenant-northstar-001';

  const outputs = await prisma.businessOutput.findMany({
    where: { tenantId },
    include: {
      agent: true,
      provenance: true,
      destinations: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">STRUCTURED OUTPUTS & PROVENANCE</h1>
          <p className="text-xs text-slate-400 mt-1">
            Executive insights, recommendations, forecasts, and action proposals with full source traceability
          </p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Structured Business Outputs Log">
        <Table
          headers={['Output Type', 'Agent Source', 'Executive Summary', 'Financial Impact', 'Data Provenance', 'Destinations']}
          rows={outputs.map((out) => [
            <Badge key="t" variant="info">{out.type}</Badge>,
            <span key="a" className="font-semibold text-slate-200">{out.agent?.name || out.source}</span>,
            out.summary,
            <span key="imp" className="font-mono text-emerald-400 font-bold">+${out.financialImpact.toLocaleString()}</span>,
            <span key="prov" className="font-mono text-xs text-slate-400">{out.provenance[0]?.sourceType || 'BANK_API'} ({out.provenance[0]?.sourceId || 'Checking #4829'})</span>,
            <Badge key="dest" variant="success">{out.destinations[0]?.type || 'DASHBOARD'}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
}
