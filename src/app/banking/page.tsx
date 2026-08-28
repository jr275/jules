import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge, StatusIndicator } from '@/components/ui/design-system';
import { Building2 } from 'lucide-react';

export const revalidate = 0;

export default async function BankingPage() {
  const connectors = await prisma.connector.findMany({ where: { type: 'BANK' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-400" />
            Banking Intelligence & Multi-Bank Connectivity
          </h1>
          <p className="text-xs text-slate-400 mt-1">Open Banking, host-to-host API status, bank fee audit, and account connectivity</p>
        </div>
      </div>

      <Panel title="Connected Banking Institutions">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bank Connector</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Credential Ref</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {connectors.map((conn) => (
              <TableRow key={conn.id}>
                <TableCell className="font-medium text-slate-200">{conn.name}</TableCell>
                <TableCell><Badge variant="neutral">{conn.type}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={conn.status} />
                    <span className="text-xs font-mono">{conn.status}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{conn.credentialReference || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
