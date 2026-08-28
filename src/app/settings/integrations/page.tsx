import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge, StatusIndicator } from '@/components/ui/design-system';

export const revalidate = 0;

export default async function IntegrationsSettingsPage() {
  const connectors = await prisma.connector.findMany();

  return (
    <div className="space-y-6">
      <Panel title="External System Connectors (ERP, Banking, Payments)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Connector Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Credential Reference</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {connectors.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-slate-200">{c.name}</TableCell>
                <TableCell><Badge variant="neutral">{c.type}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={c.status} />
                    <span className="text-xs font-mono">{c.status}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{c.credentialReference || 'NONE'}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
