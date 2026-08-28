import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';

export const revalidate = 0;

export default async function OrgSettingsPage() {
  const tenant = await prisma.tenant.findFirst({
    include: { organizations: { include: { entities: true } } },
  });

  return (
    <div className="space-y-6">
      <Panel title="Tenant & Organization Boundary">
        <div className="space-y-3 text-xs font-mono bg-slate-950 p-4 rounded border border-slate-800 mb-4">
          <div><span className="text-slate-500">TENANT ID:</span> {tenant?.id}</div>
          <div><span className="text-slate-500">TENANT NAME:</span> {tenant?.name}</div>
          <div><span className="text-slate-500">STATUS:</span> <Badge variant="success">{tenant?.status}</Badge></div>
        </div>

        <h3 className="text-sm font-semibold text-slate-200 mb-2">Legal Entities ({tenant?.organizations[0]?.entities.length || 0})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Functional Currency</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {tenant?.organizations[0]?.entities.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-slate-200">{e.name}</TableCell>
                <TableCell className="font-mono text-xs">{e.country}</TableCell>
                <TableCell className="font-mono text-xs text-emerald-400">{e.currency}</TableCell>
                <TableCell><Badge variant="success">{e.status}</Badge></TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
