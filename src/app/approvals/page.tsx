import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';

export const revalidate = 0;

export default async function ApprovalsPage() {
  const tenantId = 'tenant-northstar-001';
  const pendingActions = await prisma.action.findMany({
    where: { tenantId, approvalStatus: 'PENDING' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">HUMAN APPROVAL GATES</h1>
          <p className="text-xs text-slate-400 mt-1">Financial safety boundary requiring explicit human authorization</p>
        </div>
        <Badge variant="warning">1 Pending Approval</Badge>
      </div>

      <Card title="Pending Financial Actions">
        <Table
          headers={['Target Destination', 'Action Type', 'Amount', 'Policy Check', 'Approval Required', 'Decision']}
          rows={pendingActions.map((r) => [
            r.target,
            <Badge key="type" variant="info">{r.type}</Badge>,
            <span key="amt" className="font-mono text-slate-200 font-bold">${r.amount.toLocaleString()} {r.currency}</span>,
            <Badge key="pol" variant="success">{r.policyStatus}</Badge>,
            <Badge key="app" variant="warning">CFO APPROVAL REQUIRED</Badge>,
            <div key="act" className="flex items-center gap-2">
              <Button size="sm" variant="primary">Approve & Execute</Button>
              <Button size="sm" variant="outline">Reject</Button>
            </div>,
          ])}
        />
      </Card>
    </div>
  );
}
