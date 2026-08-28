import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function DecisionsPage() {
  const tenantId = 'tenant-northstar-001';
  const decisions = await prisma.decision.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">FINANCIAL DECISIONS</h1>
          <p className="text-xs text-slate-400 mt-1">Explainable AI decision log with evidence and policy checks</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Decision Audit Log">
        <Table
          headers={['Problem / Insight', 'AI Recommendation', 'Impact', 'Policy', 'Approval']}
          rows={decisions.map((r) => [
            r.problem,
            r.recommendation,
            <span key="imp" className="font-mono text-emerald-400">+${r.economicImpact.toLocaleString()}</span>,
            <Badge key="pol" variant={r.policyStatus === 'PASSED' ? 'success' : 'danger'}>{r.policyStatus}</Badge>,
            <Badge key="app" variant="warning">{r.approvalStatus}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
}
