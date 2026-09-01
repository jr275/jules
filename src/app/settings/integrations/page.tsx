import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';

export const revalidate = 0;

export default async function IntegrationsSettingsPage() {
  const tenantId = 'tenant-northstar-001';
  const connectors = await prisma.connector.findMany({ where: { tenantId } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">SYSTEM CONNECTORS & INTEGRATIONS</h1>
          <p className="text-xs text-slate-400 mt-1">External ERP, Banking, Accounting, and Payment Connectors</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Configured Connectors">
        <Table
          headers={['Connector Name', 'Type', 'Status', 'Secret Ref']}
          rows={connectors.map((r) => [
            r.name,
            <Badge key="type" variant="info">{r.type}</Badge>,
            <Status key="stat" type={r.status as any} />,
            <span key="ref" className="font-mono text-xs">{r.credentialReference || 'None'}</span>,
          ])}
        />
      </Card>
    </div>
  );
}
