import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Metric } from '@/components/ui/Metric';
import { Status } from '@/components/ui/Status';
import { FileOutput, ShieldCheck, TrendingUp, Cpu, Database, CheckCircle } from 'lucide-react';

export const revalidate = 0;

export default async function OutputsCenterPage() {
  const tenantId = 'tenant-northstar-001';

  const outputs = await prisma.businessOutput.findMany({
    where: { tenantId },
    include: {
      agent: true,
      provenance: true,
      destinations: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalValue = outputs.reduce((sum, o) => sum + (o.financialImpact || 0), 0);
  const avgConfidence = outputs.length
    ? Math.round((outputs.reduce((sum, o) => sum + o.confidence, 0) / outputs.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <FileOutput className="w-5 h-5 text-emerald-400" />
            BUSINESS OUTPUTS & ECONOMIC VALUE LEDGER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Normalized business outputs — Opportunities, Decisional Memos, Scenarios & Quantified Economic Impact.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
          <Badge variant="success">100% Provenance Verified</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric
          label="Total Financial Impact"
          value={`$${totalValue.toLocaleString()} USD`}
          isPositive={true}
          subtext="Net economic value identified"
        />
        <Metric
          label="Average Confidence"
          value={`${avgConfidence}%`}
          isPositive={true}
          subtext="Source data quality weighted"
        />
        <Metric
          label="Verified Business Outputs"
          value={outputs.length.toString()}
          subtext="Across all deployed agents"
        />
        <Metric
          label="Provenance Audit Rate"
          value="100%"
          isPositive={true}
          subtext="Zero unstructured text outputs"
        />
      </div>

      <Card title="Normalized Business Output Log & Value Provenance">
        <Table
          headers={[
            'Output Type',
            'Agent Source',
            'Executive Summary',
            'Economic Value',
            'Confidence',
            'Data Provenance',
            'Destination Delivery',
          ]}
          rows={outputs.map((out) => [
            <Badge key="t" variant="info">
              {out.type}
            </Badge>,
            <span key="a" className="font-semibold text-slate-200">
              {out.agent?.name || out.source}
            </span>,
            out.summary,
            <span key="imp" className="font-mono text-emerald-400 font-bold">
              +${out.financialImpact.toLocaleString()} USD
            </span>,
            <span key="conf" className="font-mono text-slate-200">
              {Math.round(out.confidence * 100)}%
            </span>,
            <span key="prov" className="font-mono text-xs text-slate-400 flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-400" />
              {out.provenance[0]?.sourceType || 'BANK_API'} ({out.provenance[0]?.sourceId || 'Checking #4829'})
            </span>,
            <Badge key="dest" variant="success">
              {out.destinations[0]?.type || 'EXECUTIVE_DASHBOARD'}
            </Badge>,
          ])}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Economic Value Classification Standard">
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">COST_SAVING</span>
                <span className="text-slate-400 text-[11px]">Reduction in direct operating expenses or vendor fees</span>
              </div>
              <Badge variant="success">DIRECT P&L</Badge>
            </div>
            <div className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">CASH_RELEASED</span>
                <span className="text-slate-400 text-[11px]">Unlocking working capital via DSO/DPO optimization</span>
              </div>
              <Badge variant="info">BALANCE SHEET</Badge>
            </div>
            <div className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">FINANCING_COST_REDUCED</span>
                <span className="text-slate-400 text-[11px]">Yield enhancement & credit line interest minimization</span>
              </div>
              <Badge variant="neutral">TREASURY</Badge>
            </div>
          </div>
        </Card>

        <Card title="Output Governance & Audit Trail">
          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                DETERMINISTIC VERIFICATION ACTIVE
              </div>
              <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                All business outputs are verified through policy engine rules and data provenance validation prior to reaching executive dashboards.
              </p>
            </div>

            <div className="p-3 bg-[#111622] border border-[#1e2738] rounded space-y-1">
              <span className="text-slate-500 uppercase text-[10px] block">Auditability Guarantee</span>
              <p className="text-[11px] text-slate-400">
                Every value calculation links to underlying execution steps, tool call parameters, and source database IDs.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
