import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';

export const revalidate = 0;

export default async function AuditSettingsPage() {
  const events = await prisma.auditEvent.findMany({
    orderBy: { timestamp: 'desc' },
  });

  return (
    <div className="space-y-6">
      <Panel title="Immutable Audit Trail & System Events">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {events.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs text-slate-400">
                  {e.timestamp.toISOString()}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-200">{e.actorEmail}</TableCell>
                <TableCell><Badge variant="info">{e.event}</Badge></TableCell>
                <TableCell className="font-mono text-xs text-slate-300">{e.resource} [{e.resourceId.slice(0, 8)}]</TableCell>
                <TableCell className="font-mono text-[11px] text-slate-500">{e.metadata}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
