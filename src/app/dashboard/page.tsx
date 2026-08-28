import React from 'react';
import { prisma } from '@/lib/db';
import { MetricCard, Card, Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';

export const revalidate = 0;

export default async function DashboardPage() {
  const values = await prisma.economicValue.findMany({ include: { entity: true } });
  const totalValue = values.reduce((sum, v) => sum + v.amount, 0);

  const opportunities = await prisma.opportunity.findMany({ take: 5, orderBy: { priorityScore: 'desc' } });
  const decisions = await prisma.decision.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  const workers = await prisma.worker.findMany();
  const risks = await prisma.risk.findMany({ take: 3 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Executive Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time economic value generation, opportunity pipeline, and worker governance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="font-mono">
            OS STATUS: ONLINE
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Economic Value Created"
          value={`$${totalValue.toLocaleString()}`}
          subtitle="Annualized value identified & captured"
          trend={{ value: '+14.2% YoY', positive: true }}
          className="border-emerald-800/40 bg-gradient-to-br from-emerald-950/20 to-slate-900"
        />
        <MetricCard
          title="Active Opportunities"
          value={opportunities.length}
          subtitle={`$${opportunities.reduce((acc, o) => acc + o.expectedValue, 0).toLocaleString()} EV`}
        />
        <MetricCard
          title="Autonomous Workers"
          value={workers.length}
          subtitle="All operating within Policy"
        />
        <MetricCard
          title="Monitored Risks"
          value={risks.length}
          subtitle="Liquidity, FX & Credit exposure"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel title="Top Ranked Opportunities by Priority Score">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Est. Value</TableHead>
                  <TableHead>Priority Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {opportunities.map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium text-slate-200">
                      <div>{opp.title}</div>
                      <div className="text-[10px] text-slate-500">{opp.recommendedAction}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{opp.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-emerald-400 font-semibold">
                      ${opp.estimatedValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {opp.priorityScore.toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{opp.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>

        <div>
          <Panel title="Recent Operating Decisions">
            <div className="space-y-4">
              {decisions.map((dec) => (
                <Card key={dec.id} className="p-3 bg-slate-950/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200">{dec.recommendation}</span>
                    <Badge variant={dec.policyStatus === 'PASSED' ? 'success' : 'warning'}>
                      {dec.policyStatus}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{dec.problem}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Impact: ${dec.economicImpact.toLocaleString()}</span>
                    <span>Approval: {dec.approvalStatus}</span>
                  </div>
                </Card>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
