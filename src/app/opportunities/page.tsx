import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function OpportunitiesPage() {
  const tenantId = 'tenant-northstar-001';
  const opportunities = await prisma.opportunity.findMany({
    where: { tenantId },
    orderBy: { estimatedValue: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">ECONOMIC OPPORTUNITIES</h1>
          <p className="text-xs text-slate-400 mt-1">Identified and quantified economic value creation opportunities</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Identified Financial Opportunities">
        <Table
          headers={['Opportunity', 'Category', 'Est. Value', 'Expected Value', 'Urgency', 'Effort', 'Confidence', 'Status']}
          rows={opportunities.map((r) => [
            r.title,
            <Badge key="cat" variant="info">{r.category}</Badge>,
            <span key="val" className="font-mono text-emerald-400 font-bold">${r.estimatedValue.toLocaleString()} {r.currency}</span>,
            <span key="exp" className="font-mono text-slate-300">${r.expectedValue.toLocaleString()}</span>,
            <Badge key="urg" variant={r.urgency === 'HIGH' ? 'warning' : 'neutral'}>{r.urgency}</Badge>,
            <Badge key="eff" variant="neutral">{r.effort}</Badge>,
            <span key="conf" className="font-mono">{Math.round(r.confidence * 100)}%</span>,
            <Badge key="stat" variant="success">{r.status}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
}
