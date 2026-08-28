import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';

export const revalidate = 0;

export default async function PoliciesSettingsPage() {
  const policies = await prisma.policy.findMany();

  return (
    <div className="space-y-6">
      <Panel title="Deterministic Authorization Policies">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Rules Specification</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {policies.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-slate-200">{p.name}</TableCell>
                <TableCell className="text-xs text-slate-400">{p.description}</TableCell>
                <TableCell className="font-mono text-[11px] text-emerald-400">{p.rules}</TableCell>
                <TableCell><Badge variant="success">{p.status}</Badge></TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
