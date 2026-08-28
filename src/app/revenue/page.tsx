import React from 'react';
import { MetricCard } from '@/components/ui/design-system';
import { DollarSign } from 'lucide-react';

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Revenue Optimization Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Revenue leakage detection, contract price uplift, and billing intelligence</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Identified Revenue Uplift" value="$420,000" subtitle="Unbilled contract terms & indexation" />
        <MetricCard title="Contract Indexation Risk" value="Low" subtitle="100% contracts adjusted for inflation" />
        <MetricCard title="DSO Trajectory" value="34.2 Days" subtitle="-4.1 Days YoY" trend={{ value: 'Improving', positive: true }} />
      </div>
    </div>
  );
}
