import React from 'react';
import { MetricCard } from '@/components/ui/design-system';
import { Sliders } from 'lucide-react';

export default function ScenariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-emerald-400" />
            Financial Scenario Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">Stress test liquidity, rate shocks, FX devaluation, and supply chain disruptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Base Case Liquidity 90D" value="$14,200,000" subtitle="Current trajectory" />
        <MetricCard title="Stress Test (FX -20%)" value="$11,800,000" subtitle="Passes $5M covenant threshold" trend={{ value: 'Covenant Safe', positive: true }} />
        <MetricCard title="AP Delay Shock (+30D)" value="$16,400,000" subtitle="Liquidity buffer expands" />
      </div>
    </div>
  );
}
