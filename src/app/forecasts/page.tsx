import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function ForecastsPage() {
  const tenantId = 'tenant-northstar-001';
  const forecasts = await prisma.forecast.findMany({ where: { tenantId } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">CASH FORECASTING ENGINE</h1>
          <p className="text-xs text-slate-400 mt-1">Predictive 13-week & 90-day cash flow probability bounds</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Active Financial Forecasts">
        <Table
          headers={['Horizon', 'Expected Cash', 'Lower Bound (P10)', 'Upper Bound (P90)', 'Model Confidence', 'Methodology']}
          rows={forecasts.map((r) => [
            <Badge key="hor" variant="info">{r.horizon}</Badge>,
            <span key="exp" className="font-mono text-emerald-400 font-bold">${r.expected.toLocaleString()} {r.currency}</span>,
            <span key="low" className="font-mono text-slate-400">${r.lowerBound.toLocaleString()}</span>,
            <span key="up" className="font-mono text-slate-400">${r.upperBound.toLocaleString()}</span>,
            <span key="conf" className="font-mono">{Math.round(r.confidence * 100)}%</span>,
            r.methodology,
          ])}
        />
      </Card>
    </div>
  );
}
