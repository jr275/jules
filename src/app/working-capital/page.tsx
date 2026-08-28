import React from 'react';
import { MetricCard } from '@/components/ui/design-system';
import { Briefcase } from 'lucide-react';

export default function WorkingCapitalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-400" />
            Working Capital Optimization
          </h1>
          <p className="text-xs text-slate-400 mt-1">AP/AR optimization, cash conversion cycle reduction, and early discount harvesting</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Cash Release Potential" value="$1,250,000" subtitle="AR collection acceleration & AP terms" />
        <MetricCard title="Cash Conversion Cycle" value="28 Days" subtitle="Industry benchmark: 42 Days" trend={{ value: '-14 Days', positive: true }} />
        <MetricCard title="Captured AP Discounts" value="$145,000" subtitle="Northstar USA Acme Steel program" />
      </div>
    </div>
  );
}
