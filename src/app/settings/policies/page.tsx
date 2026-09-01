import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function PoliciesSettingsPage() {
  const tenantId = 'tenant-northstar-001';
  const policies = await prisma.policy.findMany({ where: { tenantId } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">DETERMINISTIC POLICIES</h1>
          <p className="text-xs text-slate-400 mt-1">Rule sets enforced deterministically before any financial execution</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Configured Safety & Threshold Policies">
        <Table
          headers={['Policy Name', 'Description', 'Status']}
          rows={policies.map((r) => [
            r.name,
            r.description,
            <Badge key="stat" variant="success">{r.status}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
}
