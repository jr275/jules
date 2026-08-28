import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function GenericDomainPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">PROCUREMENT INTELLIGENCE</h1>
          <p className="text-xs text-slate-400 mt-1">Supplier benchmarking and contract negotiation optimization</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>
      <Card title="Procurement Intelligence Module">
        <div className="p-6 text-center text-xs text-slate-400 font-mono">
          Procurement Workers analyzing active vendor contracts.
        </div>
      </Card>
    </div>
  );
}
