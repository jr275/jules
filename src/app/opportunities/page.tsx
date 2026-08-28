import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';
import { TrendingUp } from 'lucide-react';

export const revalidate = 0;

export default async function OpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { priorityScore: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Ranked Economic Value Opportunities
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized economic opportunities ranked by Economic Impact × Probability × Urgency / Risk
          </p>
        </div>
      </div>

      <Panel title={`Identified Value Pipeline (${opportunities.length})`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title & Action</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Est. Value</TableHead>
              <TableHead>Exp. Value</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Priority Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {opportunities.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell className="font-medium text-slate-200">
                  <div className="font-semibold text-slate-100">{opp.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{opp.description}</div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1">
                    RECOMMENDED: {opp.recommendedAction}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">{opp.category}</Badge>
                </TableCell>
                <TableCell className="font-mono text-slate-200">
                  ${opp.estimatedValue.toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-emerald-400 font-semibold">
                  ${opp.expectedValue.toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {Math.round(opp.confidence * 100)}%
                </TableCell>
                <TableCell className="font-mono font-bold text-amber-400">
                  {opp.priorityScore.toFixed(1)}
                </TableCell>
                <TableCell>
                  <Badge variant="info">{opp.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
