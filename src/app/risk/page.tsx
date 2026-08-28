import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';
import { ShieldAlert } from 'lucide-react';

export const revalidate = 0;

export default async function RiskPage() {
  const risks = await prisma.risk.findMany({ include: { entity: true } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-400" />
            Financial Risk Intelligence & Exposure
          </h1>
          <p className="text-xs text-slate-400 mt-1">Continuous monitoring of FX, Liquidity, Credit, and Counterparty exposures</p>
        </div>
      </div>

      <Panel title="Monitored Risk Exposures">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Exposure</TableHead>
              <TableHead>Probability / Impact</TableHead>
              <TableHead>Mitigation Strategy</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {risks.map((r) => (
              <TableRow key={r.id}>
                <TableCell><Badge variant="warning">{r.category}</Badge></TableCell>
                <TableCell className="text-xs text-slate-300">{r.entity.name}</TableCell>
                <TableCell className="font-mono font-semibold text-rose-400">
                  ${r.exposure.toLocaleString()} {r.currency}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400">
                  P: {Math.round(r.probability * 100)}% / I: {Math.round(r.impact * 100)}%
                </TableCell>
                <TableCell className="text-xs text-slate-300">{r.mitigation}</TableCell>
                <TableCell><Badge variant="neutral">{r.status}</Badge></TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
