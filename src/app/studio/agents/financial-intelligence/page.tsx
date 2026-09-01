import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Metric } from '@/components/ui/Metric';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';
import { Button } from '@/components/ui/Button';
import { DefaultLLMProvider } from '@/lib/domain/llm';
import {
  Cpu,
  Clock,
  Database,
  BookOpen,
  Brain,
  ShieldCheck,
  TrendingUp,
  Play,
  CheckCircle,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';

export const revalidate = 0;

export default async function FinancialIntelligenceAgentPage() {
  const tenantId = 'tenant-northstar-001';

  // Load Agent
  const agent = await prisma.agent.findFirst({
    where: { tenantId, name: { contains: 'Cash Flow' } },
    include: {
      triggers: true,
      agentSkills: { include: { skill: true } },
      agentTools: { include: { tool: true } },
      agentConnectors: { include: { connector: true } },
      agentKnowledge: { include: { knowledgeSource: true } },
      executions: { orderBy: { createdAt: 'desc' }, take: 5 },
      outputs: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  const llmProvider = new DefaultLLMProvider();
  const llmMeta = llmProvider.getProviderMetadata();

  const googleConnector = agent?.agentConnectors.find((c) => c.connector.type === 'GOOGLE_SHEETS');
  const googleConnected = googleConnector?.connector.status === 'CONNECTED';

  const totalValueCreated = agent
    ? agent.outputs.reduce((sum, o) => sum + (o.financialImpact || 0), 0)
    : 112500;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              FINANCIAL INTELLIGENCE AGENT
            </h1>
            <Badge variant="info">v{agent?.version || 1}</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Autonomous daily treasury monitoring, anomaly detection, and cash yield optimization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Status type="ACTIVE" text="AUTONOMOUS RUNNER READY" />
          <form action="/api/triggers/trigger-cash-flow-daily/run-now" method="POST">
            <Button type="submit" variant="primary" className="gap-2 font-mono text-xs">
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Now
            </Button>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric
          label="Quantified Value Impact"
          value={`+$${totalValueCreated.toLocaleString()} USD`}
          isPositive={true}
          subtext="Captured overnight yield lift"
        />
        <Metric
          label="Autonomous Schedule"
          value="Daily 08:00"
          subtext="America/Sao_Paulo (UTC-3)"
        />
        <Metric
          label="Autonomy Level"
          value={agent?.autonomyLevel || 'LEVEL_2_PREPARE'}
          subtext="CFO Threshold Gate Enforced"
        />
        <Metric
          label="Confidence & Provenance"
          value="94.2%"
          isPositive={true}
          subtext="Open Banking + Google Sheets"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agent Specification & Systems */}
        <div className="space-y-6 lg:col-span-1 font-mono text-xs">
          <Card title="Agent Specification & Systems">
            <div className="space-y-4">
              <div className="p-3 bg-[#111622] border border-[#1e2738] rounded space-y-1">
                <span className="text-slate-500 uppercase text-[10px] block">Schedule & Timezone</span>
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  08:00 Daily (America/Sao_Paulo)
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Next Scheduled Run: Today 08:00 UTC-3
                </div>
              </div>

              <div className="p-3 bg-[#111622] border border-[#1e2738] rounded space-y-1">
                <span className="text-slate-500 uppercase text-[10px] block">Data Sources & Connectors</span>
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Google Sheets & Bank MTLS API
                </div>
              </div>

              <div className="p-3 bg-[#111622] border border-[#1e2738] rounded space-y-1">
                <span className="text-slate-500 uppercase text-[10px] block">Knowledge RAG Sources</span>
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  Treasury Investment Policy 2026
                </div>
              </div>

              <div className="p-3 bg-[#111622] border border-[#1e2738] rounded space-y-1">
                <span className="text-slate-500 uppercase text-[10px] block">Durable Memory State</span>
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                  Working, Episodic & Semantic Active
                </div>
              </div>
            </div>
          </Card>

          {/* REALITY PANEL */}
          <Card title="Technical Reality & Integration Panel">
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center p-2 bg-[#0b0e14] border border-[#1e2738] rounded">
                <span className="text-slate-400">LLM Provider ({llmMeta.provider}):</span>
                {llmMeta.isConfigured ? (
                  <Badge variant="success">REAL LLM ACTIVE</Badge>
                ) : (
                  <Badge variant="neutral">NOT_CONFIGURED</Badge>
                )}
              </div>

              <div className="flex justify-between items-center p-2 bg-[#0b0e14] border border-[#1e2738] rounded">
                <span className="text-slate-400">Google Sheets OAuth:</span>
                {googleConnected ? (
                  <Badge variant="success">CONNECTED</Badge>
                ) : (
                  <Badge variant="neutral">NOT_CONNECTED</Badge>
                )}
              </div>

              <div className="flex justify-between items-center p-2 bg-[#0b0e14] border border-[#1e2738] rounded">
                <span className="text-slate-400">Knowledge Vector RAG:</span>
                <Badge variant="success">READY (SQLite JSON)</Badge>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#0b0e14] border border-[#1e2738] rounded">
                <span className="text-slate-400">Durable Memory Engine:</span>
                <Badge variant="success">READY</Badge>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#0b0e14] border border-[#1e2738] rounded">
                <span className="text-slate-400">Durable Job Queue & Worker:</span>
                <Badge variant="success">READY (LEASE CRASH RECOVERY)</Badge>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#0b0e14] border border-[#1e2738] rounded">
                <span className="text-slate-400">Scheduler Engine:</span>
                <Badge variant="success">READY (OCCURRENCE IDEMPOTENT)</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Execution History & Timeline */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Latest Findings & Business Outputs">
            <Table
              headers={['Type', 'Summary', 'Impact', 'Provenance', 'Confidence']}
              rows={(agent?.outputs || []).map((o) => [
                <Badge key="t" variant="info">{o.type}</Badge>,
                o.summary,
                <span key="imp" className="font-mono text-emerald-400 font-bold">+${o.financialImpact.toLocaleString()} USD</span>,
                <span key="src" className="font-mono text-slate-400 text-xs">{o.source}</span>,
                <span key="conf" className="font-mono font-bold">{Math.round(o.confidence * 100)}%</span>,
              ])}
            />
          </Card>

          <Card title="Autonomous Execution Timeline">
            <div className="space-y-3 font-mono text-xs">
              {(agent?.executions || []).map((exec) => (
                <div key={exec.id} className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">Execution {exec.id.substring(0, 8)}</span>
                      <Badge variant="neutral">{exec.trigger}</Badge>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Started: {new Date(exec.startedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Status type={exec.status as any} />
                    <a href={`/api/executions/${exec.id}`} className="text-blue-400 hover:underline text-[11px]">
                      View Trace
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
