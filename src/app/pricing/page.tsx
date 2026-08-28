import React from 'react';
import { MetricCard } from '@/components/ui/design-system';
import { Tag } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-400" />
            Dynamic Pricing & Margin Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Customer margin optimization, elasticity modeling, and pricing tier guardrails</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Gross Margin Target" value="68.4%" subtitle="Target: 65.0%" trend={{ value: '+3.4%', positive: true }} />
        <MetricCard title="Margin Leakage Shielded" value="$185,000" subtitle="Discount over-ride enforcement" />
        <MetricCard title="Active Price Tests" value="2 Cohorts" subtitle="Enterprise SaaS elasticity tier" />
      </div>
    </div>
  );
}
