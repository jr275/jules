import React from 'react';
import { prisma } from '@/lib/prisma';
import { Metric } from '@/components/ui/Metric';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';

export const revalidate = 0;

export default async function ExecutiveDashboard() {
  const tenantId = 'tenant-northstar-001';

  const economicValues = await prisma.economicValue.findMany({ where: { tenantId } });
  const totalEconomicValueCreated = economicValues.reduce((sum, item) => sum + item.amount, 0);

  const opportunities = await prisma.opportunity.findMany({
    where: { tenantId },
    orderBy: { expectedValue: 'desc' },
  });

  const decisions = await prisma.decision.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  const actions = await prisma.action.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  const risks = await prisma.risk.findMany({
    where: { tenantId },
  });

  const executions = await prisma.execution.findMany({
    where: { tenantId },
    include: { worker: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100">EXECUTIVE COMMAND CENTER</h1>
            <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous Financial Intelligence OS — Quantifying & Capturing Enterprise Value
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>Autonomy: LEVEL 2 PREPARE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      <div>
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
          1. Economic Value Created & Quantified
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Metric
            label="Total Economic Value Created"
            value={`$${totalEconomicValueCreated.toLocaleString()} USD`}
            change="+14.2%"
            isPositive={true}
            subtext="Net annual interest yield & cost savings captured"
          />
          <Metric
            label="Identified Opportunities"
            value={`$${opportunities.reduce((a, b) => a + b.estimatedValue, 0).toLocaleString()} USD`}
            change="+8.4%"
            isPositive={true}
            subtext="Identified by autonomous workers"
          />
          <Metric
            label="Risk Exposure Quantified"
            value={`$${risks.reduce((a, b) => a + b.exposure, 0).toLocaleString()} USD`}
            change="-5.1%"
            isPositive={true}
            subtext="Active FX & liquidity risk monitored"
          />
          <Metric
            label="Active Workers Operating"
            value="3 Units"
            subtext="100% Policy compliant"
          />
        </div>
      </div>

      <Card title="2. Top Identified Value Opportunities" subtitle="Prioritized by Net Economic Value x Feasibility x Risk">
        <Table
          headers={['Opportunity Title', 'Category', 'Est. Value', 'Urgency', 'Confidence', 'Status']}
          rows={opportunities.map((r) => [
            r.title,
            <Badge key="cat" variant="info">{r.category}</Badge>,
            <span key="val" className="font-mono font-semibold text-emerald-400">${r.estimatedValue.toLocaleString()} {r.currency}</span>,
            <Badge key="urg" variant={r.urgency === 'HIGH' ? 'warning' : 'neutral'}>{r.urgency}</Badge>,
            <span key="conf" className="font-mono text-xs">{Math.round(r.confidence * 100)}%</span>,
            <Badge key="stat" variant="neutral">{r.status}</Badge>,
          ])}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="3. Pending Executive Decisions" subtitle="Explanation & evidence provided by AI Workers">
          <Table
            headers={['Problem / Insight', 'Impact', 'Policy', 'Approval']}
            rows={decisions.map((r) => [
              r.problem,
              <span key="imp" className="font-mono text-emerald-400">+${r.economicImpact.toLocaleString()}</span>,
              <Badge key="pol" variant={r.policyStatus === 'PASSED' ? 'success' : 'danger'}>{r.policyStatus}</Badge>,
              <Badge key="app" variant="warning">{r.approvalStatus}</Badge>,
            ])}
          />
        </Card>

        <Card title="4. Proposed Actions & Execution Queue" subtitle="Passing through deterministic policy & approval gates">
          <Table
            headers={['Action Target', 'Type', 'Amount', 'Status']}
            rows={actions.map((r) => [
              r.target,
              <Badge key="type" variant="neutral">{r.type}</Badge>,
              <span key="amt" className="font-mono">${r.amount.toLocaleString()} {r.currency}</span>,
              <Badge key="stat" variant="neutral">{r.status}</Badge>,
            ])}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="5. Quantified Financial Risks" subtitle="Continuous liquidity, FX, and credit exposure tracking">
          <Table
            headers={['Category', 'Exposure', 'Impact', 'Mitigation Plan']}
            rows={risks.map((r) => [
              <Badge key="cat" variant="danger">{r.category}</Badge>,
              <span key="exp" className="font-mono text-rose-400">${r.exposure.toLocaleString()} {r.currency}</span>,
              <Badge key="imp" variant="warning">{r.impact}</Badge>,
              r.mitigation,
            ])}
          />
        </Card>

        <Card title="6. Recent Autonomous Worker Executions" subtitle="Step-by-step pipeline execution and verification">
          <Table
            headers={['Worker Unit', 'Trigger', 'Status', 'Executed At']}
            rows={executions.map((r) => [
              <span key="wrk" className="font-semibold text-slate-200">{r.worker?.name || 'Worker'}</span>,
              <Badge key="trig" variant="neutral">{r.trigger}</Badge>,
              <Status key="stat" type={r.status as any} />,
              <span key="time" className="font-mono text-slate-500">{new Date(r.createdAt).toLocaleTimeString()}</span>,
            ])}
          />
        </Card>
      </div>
    </div>
  );
}
