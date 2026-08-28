'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AgentTestLab } from '@/components/agent/AgentTestLab';
import { useRouter } from 'next/navigation';

const BUILDER_STEPS = [
  '1. IDENTITY',
  '2. OBJECTIVE',
  '3. SKILLS',
  '4. TOOLS',
  '5. CONNECTORS',
  '6. KNOWLEDGE',
  '7. POLICIES',
  '8. AUTONOMY',
  '9. TEST LAB',
  '10. REVIEW & DEPLOY',
];

export interface AgentBuilderProps {
  initialAgent?: {
    id?: string;
    name?: string;
    description?: string;
    objective?: string;
    rolePersona?: string;
    autonomyLevel?: string;
    skills?: string[];
    tools?: string[];
  };
}

export function AgentBuilder({ initialAgent }: AgentBuilderProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [agentData, setAgentData] = useState({
    name: initialAgent?.name || 'Cash Flow & Liquidity Agent',
    description:
      initialAgent?.description ||
      'Continuously monitors bank balances, forecasts 13-week cash, and optimizes liquidity yield.',
    objective:
      initialAgent?.objective ||
      'Eliminate idle liquid balances above target cash buffer and prevent financing deficits.',
    rolePersona: initialAgent?.rolePersona || 'Senior Treasury AI Specialist',
    targetEntity: 'Northstar Corporation US (USD)',
    skills: initialAgent?.skills || ['Cash Forecasting', 'Payment Intelligence', 'Yield Optimization'],
    tools: initialAgent?.tools || ['Bank Account Balance Query', 'ERP Payables Scanner', 'Yield Rate Calculator'],
    connectors: ['JPMorgan Chase API', 'Google Workspace', 'PostgreSQL ERP Read-Replica'],
    knowledge: ['FY26 Cash Reserve Target Matrix.pdf', 'Corporate Treasury Investment Policy 2026.pdf'],
    policyRules: [
      'POL-TREASURY-01: Auto-prepare sweep proposals up to $5M',
      'POL-RISK-02: Require CFO approval for >$100k outflows',
    ],
    autonomyLevel: initialAgent?.autonomyLevel || 'LEVEL_2_PREPARE',
    triggerSchedule: 'Every 4 Hours (Cron)',
    outputDestination: 'Executive Dashboard & Slack Treasury Alert Channel',
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, BUILDER_STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const toggleSkill = (skill: string) => {
    setAgentData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleTool = (tool: string) => {
    setAgentData((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  const handleSaveAndDeploy = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const endpoint = initialAgent?.id ? `/api/agents/${initialAgent.id}` : '/api/agents';
      const method = initialAgent?.id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentData.name,
          description: agentData.description,
          objective: agentData.objective,
          rolePersona: agentData.rolePersona,
          autonomyLevel: agentData.autonomyLevel,
          skills: agentData.skills,
          tools: agentData.tools,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to persist agent');
      }

      const agentId = data.agent?.id || initialAgent?.id || 'agent-cash-flow';
      router.push(`/studio/agents/${agentId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the agent.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Navigation Bar */}
      <div className="bg-[#131926] border border-[#1e2738] rounded p-3 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[900px] text-xs font-mono">
          {BUILDER_STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-[#1a2333] text-emerald-400 font-semibold border border-emerald-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#192131]'
                }`}
              >
                <span>{step}</span>
                {isCompleted && <span className="text-emerald-400">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Builder Step Card */}
      <Card
        title={`Step ${currentStep + 1}: ${BUILDER_STEPS[currentStep]}`}
        subtitle="Configure autonomous financial agent workflow specifications with progressive disclosure"
      >
        {/* Step 0: Identity */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <Input
              label="Agent Name"
              value={agentData.name}
              onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
            />
            <Input
              label="Role Persona / Specialist Title"
              value={agentData.rolePersona}
              onChange={(e) => setAgentData({ ...agentData, rolePersona: e.target.value })}
            />
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400 uppercase">Agent Description</label>
              <textarea
                className="w-full bg-[#131926] border border-[#1e2738] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 min-h-[80px]"
                value={agentData.description}
                onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 1: Objective */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400 uppercase">Primary Financial Objective</label>
              <textarea
                className="w-full bg-[#131926] border border-[#1e2738] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 min-h-[80px]"
                value={agentData.objective}
                onChange={(e) => setAgentData({ ...agentData, objective: e.target.value })}
              />
            </div>
            <Input
              label="Target Operating Entity"
              value={agentData.targetEntity}
              onChange={(e) => setAgentData({ ...agentData, targetEntity: e.target.value })}
            />
          </div>
        )}

        {/* Step 2: Skills */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Select first-class reusable skills for this agent:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Cash Forecasting', desc: 'Predict short-term and 13-week cash balances' },
                { name: 'Payment Intelligence', desc: 'Optimize vendor payment dates to maximize working capital' },
                { name: 'Yield Optimization', desc: 'Identify surplus balances & sweep to interest-bearing funds' },
                { name: 'Working Capital Management', desc: 'Monitor AR/AP metrics (DSO, DPO, CCC)' },
                { name: 'Invoice Processing & AR', desc: 'Detect overdue invoices & recommend collection priorities' },
                { name: 'FX Exposure Risk', desc: 'Monitor multi-currency cash positioning and currency risk' },
              ].map((s) => {
                const selected = agentData.skills.includes(s.name);
                return (
                  <div
                    key={s.name}
                    onClick={() => toggleSkill(s.name)}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selected
                        ? 'bg-blue-950/40 border-blue-500 text-slate-100'
                        : 'bg-[#111622] border-[#1e2738] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-bold">{s.name}</span>
                      {selected && <Badge variant="info">ACTIVE</Badge>}
                    </div>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Tools */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Select executable capabilities available to this agent:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Bank Account Balance Query', desc: 'Read-only access to bank ledger & real-time balances' },
                { name: 'ERP Payables Scanner', desc: 'Query open AP vendor invoices & payment due dates' },
                { name: 'Yield Rate Calculator', desc: 'Calculate NPV/IRR for overnight yield vs interest cost' },
                { name: 'Draft Payment Voucher', desc: 'Prepare payment draft for human CFO approval' },
              ].map((t) => {
                const selected = agentData.tools.includes(t.name);
                return (
                  <div
                    key={t.name}
                    onClick={() => toggleTool(t.name)}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selected
                        ? 'bg-blue-950/40 border-blue-500 text-slate-100'
                        : 'bg-[#111622] border-[#1e2738] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-bold">{t.name}</span>
                      {selected && <Badge variant="info">ENABLED</Badge>}
                    </div>
                    <p className="text-[11px] text-slate-400">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Connectors */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Attached Enterprise Connectors & Systems:</p>
            <div className="space-y-2">
              {agentData.connectors.map((c) => (
                <div key={c} className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-200">🔗 {c}</span>
                  <Badge variant="success">CONNECTED</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Knowledge */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Consulted Knowledge Sources & Domain Context:</p>
            <div className="space-y-2">
              {agentData.knowledge.map((k) => (
                <div key={k} className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-200">📄 {k}</span>
                  <span className="text-[10px] text-slate-500 uppercase">DOCUMENT STORE</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Policies */}
        {currentStep === 6 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Deterministic Financial Policies & Rules:</p>
            <div className="space-y-2">
              {agentData.policyRules.map((pol) => (
                <div key={pol} className="p-3 bg-[#111622] border border-[#1e2738] rounded text-xs font-mono text-slate-300 flex justify-between items-center">
                  <span>🛡️ {pol}</span>
                  <Badge variant="warning">STRICT RULE</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Autonomy */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Select Autonomy Operating Level:</p>
            <div className="space-y-2">
              {[
                { level: 'LEVEL_0_OBSERVE', desc: 'Observe & log financial metrics without recommendation' },
                { level: 'LEVEL_1_RECOMMEND', desc: 'Generate recommendations for review' },
                { level: 'LEVEL_2_PREPARE', desc: 'Prepare decision packages & draft actions for approval (Recommended)' },
                { level: 'LEVEL_3_EXECUTE_WITHIN_POLICY', desc: 'Execute automatically up to strict policy thresholds' },
                { level: 'LEVEL_4_AUTONOMOUS_OPTIMIZATION', desc: 'Fully autonomous capital optimization' },
              ].map((lvl) => (
                <div
                  key={lvl.level}
                  onClick={() => setAgentData({ ...agentData, autonomyLevel: lvl.level })}
                  className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                    agentData.autonomyLevel === lvl.level
                      ? 'bg-blue-950/40 border-blue-500 text-slate-100'
                      : 'bg-[#111622] border-[#1e2738] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="text-xs font-mono font-bold">{lvl.level}</div>
                    <div className="text-[11px] text-slate-400">{lvl.desc}</div>
                  </div>
                  {agentData.autonomyLevel === lvl.level && <Badge variant="info">SELECTED</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Test Lab */}
        {currentStep === 8 && (
          <AgentTestLab
            agentId={initialAgent?.id || 'agent-cash-flow'}
            initialConfig={{
              name: agentData.name,
              objective: agentData.objective,
              skills: agentData.skills,
              tools: agentData.tools,
              autonomyLevel: agentData.autonomyLevel,
            }}
          />
        )}

        {/* Step 9: Review & Deploy */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-[#1e2738] pb-2">
                <span className="text-slate-400">Agent Identity:</span>
                <span className="text-slate-100 font-bold">{agentData.name} ({agentData.rolePersona})</span>
              </div>
              <div className="flex justify-between border-b border-[#1e2738] pb-2">
                <span className="text-slate-400">Target Entity:</span>
                <span className="text-slate-100">{agentData.targetEntity}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e2738] pb-2">
                <span className="text-slate-400">Active Skills:</span>
                <span className="text-slate-100">{agentData.skills.join(', ')}</span>
              </div>
              <div className="flex justify-between border-b border-[#1e2738] pb-2">
                <span className="text-slate-400">Autonomy Level:</span>
                <Badge variant="info">{agentData.autonomyLevel}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output Destination:</span>
                <span className="text-slate-100">{agentData.outputDestination}</span>
              </div>
            </div>

            <div className="p-6 bg-emerald-950/30 border border-emerald-800/60 rounded text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center font-mono font-bold">
                ✓
              </div>
              <h3 className="text-sm font-bold text-slate-100">Ready to Deploy Agent</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Agent will be persisted to Northstar Corporation tenant database with deterministic policy enforcement.
              </p>
              <Button variant="primary" onClick={handleSaveAndDeploy} disabled={isSaving}>
                {isSaving ? 'Persisting to Database...' : 'Deploy Agent to Production'}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Bar Footer */}
        <div className="mt-6 pt-4 border-t border-[#1e2738] flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            Previous Step
          </Button>
          <span className="text-xs font-mono text-slate-500">
            Step {currentStep + 1} of {BUILDER_STEPS.length}
          </span>
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={currentStep === BUILDER_STEPS.length - 1}
          >
            Next Step
          </Button>
        </div>
      </Card>
    </div>
  );
}
