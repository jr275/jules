import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, MetricCard } from '@/components/ui/design-system';
import { Landmark } from 'lucide-react';

export const revalidate = 0;

export default async function TreasuryPage() {
  const values = await prisma.economicValue.findMany({ where: { type: 'COST_SAVING' } });
  const totalSavings = values.reduce((acc, v) => acc + v.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-400" />
            Treasury & Liquidity Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cash positioning, automated sweep optimization, yield maximization, and bank fee analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Cash Position" value="$18,450,000" subtitle="Across 4 bank accounts" />
        <MetricCard title="Treasury Yield Savings" value={`$${totalSavings.toLocaleString()}`} subtitle="Annualized captured yield" trend={{ value: '+8.4%', positive: true }} />
        <MetricCard title="Buffer Compliance" value="100%" subtitle="Minimum $5M liquidity met" />
      </div>

      <Panel title="Active Treasury Optimization Programs">
        <div className="p-4 text-xs text-slate-400 font-mono bg-slate-950 rounded border border-slate-800">
          [ACTIVE PROGRAM] Dynamic Cash Sweep to Money Market Fund — Target Yield: +185 bps
        </div>
      </Panel>
    </div>
  );
}
