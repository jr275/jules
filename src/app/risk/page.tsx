import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function RiskPage() {
  const tenantId = 'tenant-northstar-001';
  const risks = await prisma.risk.findMany({ where: { tenantId } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">FINANCIAL RISK & EXPOSURE</h1>
          <p className="text-xs text-slate-400 mt-1">FX, Liquidity, Credit, and Counterparty Risk Quantification</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Active Risk Matrix">
        <Table
          headers={['Risk Category', 'Quantified Exposure', 'Impact Level', 'Confidence', 'Recommended Mitigation', 'Status']}
          rows={risks.map((r) => [
            <Badge key="cat" variant="danger">{r.category}</Badge>,
            <span key="exp" className="font-mono text-rose-400 font-bold">${r.exposure.toLocaleString()} {r.currency}</span>,
            <Badge key="imp" variant="warning">{r.impact}</Badge>,
            <span key="conf" className="font-mono">{Math.round(r.confidence * 100)}%</span>,
            r.mitigation,
            <Badge key="stat" variant="neutral">{r.status}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
}
