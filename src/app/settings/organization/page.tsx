import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function OrgSettingsPage() {
  const tenantId = 'tenant-northstar-001';
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      organizations: {
        include: { entities: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">ORGANIZATION & ENTITY HIERARCHY</h1>
          <p className="text-xs text-slate-400 mt-1">Tenant security boundaries, organizations, and legal entities</p>
        </div>
        <Badge variant="info">Tenant ID: {tenant?.id}</Badge>
      </div>

      <Card title={`Tenant: ${tenant?.name}`}>
        <div className="space-y-4">
          {tenant?.organizations.map((org) => (
            <div key={org.id} className="p-4 bg-[#111622] border border-[#1e2738] rounded">
              <h3 className="text-sm font-bold text-slate-200">{org.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Org ID: {org.id}</p>

              <div className="mt-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Legal Entities</h4>
                <Table
                  headers={['Entity Name', 'Country', 'Currency', 'Status']}
                  rows={org.entities.map((r) => [
                    r.name,
                    <Badge key="cnt" variant="neutral">{r.country}</Badge>,
                    <span key="cur" className="font-mono">{r.currency}</span>,
                    <Badge key="stat" variant="success">{r.status}</Badge>,
                  ])}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
