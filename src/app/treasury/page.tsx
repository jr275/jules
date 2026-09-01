import React from 'react';
import { Card } from '@/components/ui/Card';
import { Metric } from '@/components/ui/Metric';
import { Badge } from '@/components/ui/Badge';

export default function TreasuryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">TREASURY & CASH MANAGEMENT</h1>
          <p className="text-xs text-slate-400 mt-1">Liquidity optimization, yield sweep, and bank account balances</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric label="Total Global Cash" value="$18,450,000 USD" change="+3.2%" isPositive={true} subtext="Across US, EU, BR entities" />
        <Metric label="Idle Uninvested Cash" value="$4,200,000 USD" change="-12.0%" isPositive={true} subtext="Target sweep identified" />
        <Metric label="Annual Yield Captured" value="$216,300 USD" change="+5.15% APY" isPositive={true} subtext="Money Market overnight rate" />
      </div>

      <Card title="Global Cash Positions by Bank Account">
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-200 block">JPMorgan Chase #4829 (USD Operating)</span>
              <span className="text-slate-500">Northstar US — Checking Account</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold block">$4,720,000 USD</span>
              <span className="text-slate-400">Yield: 0.15% APY</span>
            </div>
          </div>
          <div className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-200 block">ING Bank N.V. #8812 (EUR Operating)</span>
              <span className="text-slate-500">Northstar Europe B.V.</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold block">€6,840,000 EUR</span>
              <span className="text-slate-400">Yield: 3.25% APY</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
