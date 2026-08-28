import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';
import { LineChart } from 'lucide-react';

export const revalidate = 0;

export default async function ForecastsPage() {
  const forecasts = await prisma.forecast.findMany({ include: { entity: true } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <LineChart className="h-5 w-5 text-emerald-400" />
            Liquidity & Cash Flow Forecasts
          </h1>
          <p className="text-xs text-slate-400 mt-1">Multi-horizon cash forecasting with confidence bands and provenance tracking</p>
        </div>
      </div>

      <Panel title="Active Financial Forecasts">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horizon</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Lower / Upper Bound</TableHead>
              <TableHead>Methodology</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {forecasts.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-xs text-emerald-400 font-bold">{f.horizon}</TableCell>
                <TableCell><Badge variant="neutral">{f.type}</Badge></TableCell>
                <TableCell className="font-mono font-bold text-slate-100">${f.expected.toLocaleString()} {f.currency}</TableCell>
                <TableCell className="font-mono text-xs text-slate-400">${f.lowerBound.toLocaleString()} - ${f.upperBound.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-slate-300">{f.methodology}</TableCell>
                <TableCell className="font-mono text-xs text-emerald-400">{Math.round(f.confidence * 100)}%</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
