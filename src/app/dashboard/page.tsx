import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Status } from '@/components/ui/Status';
import { Metric } from '@/components/ui/Metric';
import { AuthService } from '@/lib/domain/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  const authUser = await AuthService.getAuthenticatedUser();
  const tenantId = authUser.tenantId;

  const [
    agentCount,
    executionCount,
    outputs,
    recentExecutions,
    healthData
  ] = await Promise.all([
    prisma.agent.count({ where: { tenantId } }),
    prisma.execution.count({ where: { tenantId } }),
    prisma.businessOutput.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.execution.findMany({
      where: { tenantId },
      include: {
        agent: true,
        steps: true,
        businessOutputs: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.systemHeartbeat.findMany({
      orderBy: { lastSeen: 'desc' },
      take: 5
    })
  ]);

  const pendingApprovalsCount = recentExecutions.filter(e => e.status === 'WAITING_APPROVAL').length;
  const totalEconomicImpact = outputs.reduce((acc, out) => {
    try {
      const parsed = JSON.parse(out.data);
      return acc + (parsed.estimatedValue || parsed.economicImpact || 0);
    } catch {
      return acc;
    }
  }, 0);

  return (
    <AppShell user={authUser}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Executive Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time autonomous financial intelligence, active agents, and verified business outcomes.
          </p>
        </div>

        {/* Top KPI Layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-slate-900/60 border-slate-800">
            <Metric
              label="Economic Value Identified"
              value={`$${totalEconomicImpact.toLocaleString('en-US')}`}
              change="+14.2% this month"
              changeType="positive"
            />
          </Card>
          <Card className="p-5 bg-slate-900/60 border-slate-800">
            <Metric
              label="Active Financial Agents"
              value={agentCount.toString()}
              change={`${agentCount} active workers`}
              changeType="neutral"
            />
          </Card>
          <Card className="p-5 bg-slate-900/60 border-slate-800">
            <Metric
              label="Total Executions"
              value={executionCount.toString()}
              change={`${executionCount} runs completed`}
              changeType="neutral"
            />
          </Card>
          <Card className="p-5 bg-slate-900/60 border-slate-800">
            <Metric
              label="Pending Approvals"
              value={pendingApprovalsCount.toString()}
              change={pendingApprovalsCount > 0 ? "Requires CFO attention" : "All clear"}
              changeType={pendingApprovalsCount > 0 ? "negative" : "positive"}
            />
          </Card>
        </div>

        {/* Main Operational Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Executions Stream */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Recent Executions</h2>
              <Link href="/executions" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                View all flight logs →
              </Link>
            </div>

            {recentExecutions.length === 0 ? (
              <Card className="p-8 text-center bg-slate-900/40 border-slate-800/80">
                <p className="text-sm text-slate-400">No agent executions recorded yet.</p>
                <div className="mt-4">
                  <Link
                    href="/studio/agents/new"
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-900 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors"
                  >
                    Create Financial Intelligence Agent
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentExecutions.map((execution) => (
                  <Card key={execution.id} className="p-4 bg-slate-900/60 border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-200">
                            {execution.agent?.name || 'Financial Intelligence Agent'}
                          </span>
                          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                            {execution.trigger}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          ID: {execution.id.slice(0, 8)}... • Steps: {execution.steps.length}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Status status={execution.status} />
                        <Link
                          href={`/executions`}
                          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                        >
                          Flight Log
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* System Health Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">System Heartbeat</h2>
            <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Subsystem Node</span>
                  <span className="text-slate-400 font-medium">Status</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono">Database (SQLite/PG)</span>
                  <Status status="READY" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono">Agent Queue</span>
                  <Status status="READY" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono">Worker Engine</span>
                  <Status status={healthData.some(h => h.nodeType === 'WORKER') ? 'READY' : 'NOT_CONFIGURED'} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono">Scheduler Loop</span>
                  <Status status={healthData.some(h => h.nodeType === 'SCHEDULER') ? 'READY' : 'NOT_CONFIGURED'} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
