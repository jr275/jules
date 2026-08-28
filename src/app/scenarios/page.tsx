import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function GenericDomainPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">SCENARIO SIMULATION ENGINE</h1>
          <p className="text-xs text-slate-400 mt-1">Stress testing cash flow under macroeconomic shocks</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>
      <Card title="Financial Simulation Engine">
        <div className="p-6 text-center text-xs text-slate-400 font-mono">
          Monte Carlo and shock scenarios ready for simulation.
        </div>
      </Card>
    </div>
  );
}
