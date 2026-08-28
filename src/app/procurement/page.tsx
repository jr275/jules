import React from 'react';
import { MetricCard } from '@/components/ui/design-system';
import { ShoppingBag } from 'lucide-react';

export default function ProcurementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-400" />
            Procurement Yield & Supplier Benchmarking
          </h1>
          <p className="text-xs text-slate-400 mt-1">Vendor benchmark intelligence, contract renegotiation triggers, and tail spend analytics</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Annualized Procurement Savings" value="$310,000" subtitle="Renegotiated software & hardware contracts" />
        <MetricCard title="Tail Spend Coverage" value="88%" subtitle="Mapped against market benchmarks" />
        <MetricCard title="Top Vendor Risk" value="Low" subtitle="Vendor concentration monitored" />
      </div>
    </div>
  );
}
