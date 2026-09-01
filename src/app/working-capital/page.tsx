import React from 'react';
import { Card } from '@/components/ui/Card';
import { Metric } from '@/components/ui/Metric';
import { Badge } from '@/components/ui/Badge';

export default function WorkingCapitalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">WORKING CAPITAL OPTIMIZATION</h1>
          <p className="text-xs text-slate-400 mt-1">DSO, DPO, receivables aging, and supplier discount capture</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric label="Days Sales Outstanding (DSO)" value="38.4 Days" change="-4.2 Days" isPositive={true} subtext="Target: 35.0 Days" />
        <Metric label="Days Payable Outstanding (DPO)" value="46.1 Days" change="+2.1 Days" isPositive={true} subtext="Target: 45.0 Days" />
        <Metric label="Vendor Early Discount Value" value="$145,000 EUR" subtext="2% 10 Net 30 Capture Opportunity" />
      </div>

      <Card title="Working Capital Optimization Actions">
        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">European Vendor Invoice #EU-8842 Early Discount</span>
            <Badge variant="success">€145,000 SAVINGS</Badge>
          </div>
          <p className="text-slate-400 mt-2">Pay tech vendor invoice early to claim 2% early payment terms before expiration on Friday.</p>
        </div>
      </Card>
    </div>
  );
}
