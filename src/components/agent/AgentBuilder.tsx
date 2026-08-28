'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

const BUILDER_STEPS = [
  '1. DEFINE',
  '2. PURPOSE',
  '3. SKILLS',
  '4. TOOLS',
  '5. CONNECTORS',
  '6. KNOWLEDGE',
  '7. BEHAVIOR',
  '8. POLICIES',
  '9. AUTONOMY',
  '10. TEST',
  '11. DEPLOY',
];

export function AgentBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentData, setAgentData] = useState({
    name: 'Cash Flow & Liquidity Agent',
    description: 'Continuously monitors bank balances, forecasts 13-week cash, and captures yield.',
    objective: 'Eliminate idle uninvested liquid balances and prevent cash shortfalls.',
    rolePersona: 'Senior Treasury Manager AI Persona',
    skills: ['Liquidity & Cash Forecasting', 'Payment & Yield Optimization'],
    tools: ['Bank Account Balance Query', 'Google Sheets Data Reader'],
    connectors: ['JPMorgan Chase Treasury API', 'Google Workspace'],
    knowledge: ['FY26 Global Revenue Forecast Sheet'],
    autonomyLevel: 'LEVEL_2_PREPARE',
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, BUILDER_STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="space-y-6">
      {/* Progress Steps Header */}
      <div className="bg-[#131926] border border-[#1e2738] rounded p-3 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[800px] text-xs font-mono">
          {BUILDER_STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div
                key={step}
                onClick={() => setCurrentStep(idx)}
                className={`cursor-pointer px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : isCompleted
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{step}</span>
                {isCompleted && <span>✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card title={BUILDER_STEPS[currentStep]} subtitle="Configure specialized financial AI agent parameters">
        {currentStep === 0 && (
          <div className="space-y-4">
            <Input
              label="Agent Name"
              value={agentData.name}
              onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
            />
            <Input
              label="Role Persona"
              value={agentData.rolePersona}
              onChange={(e) => setAgentData({ ...agentData, rolePersona: e.target.value })}
            />
            <Input
              label="Description"
              value={agentData.description}
              onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <Input
              label="Primary Financial Objective"
              value={agentData.objective}
              onChange={(e) => setAgentData({ ...agentData, objective: e.target.value })}
            />
            <div className="p-3 bg-[#111622] border border-[#1e2738] rounded text-xs font-mono text-slate-300">
              <span className="text-slate-500 block uppercase mb-1">Target Entity & Currency</span>
              <span>Northstar Corporation US (USD)</span>
            </div>
          </div>
        )}

        {currentStep >= 2 && currentStep <= 9 && (
          <div className="space-y-4">
            <div className="p-4 bg-[#111622] border border-[#1e2738] rounded text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Assigned Skills:</span>
                <span className="font-mono text-slate-200">{agentData.skills.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Connected Tools:</span>
                <span className="font-mono text-slate-200">{agentData.tools.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Autonomy Level:</span>
                <Badge variant="info">{agentData.autonomyLevel}</Badge>
              </div>
            </div>
          </div>
        )}

        {currentStep === 10 && (
          <div className="p-6 bg-emerald-950/30 border border-emerald-800/60 rounded text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center font-mono font-bold">
              ✓
            </div>
            <h3 className="text-sm font-bold text-slate-100">Ready for Production Deployment</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Agent {agentData.name} will operate under Autonomy Level 2 (Prepare) and enforce CFO approval thresholds.
            </p>
            <Button variant="primary" onClick={() => (window.location.href = '/studio/workers')}>
              Deploy Agent
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-[#1e2738] flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
          <span className="text-xs font-mono text-slate-500">
            Step {currentStep + 1} of {BUILDER_STEPS.length}
          </span>
          <Button variant="primary" onClick={nextStep} disabled={currentStep === BUILDER_STEPS.length - 1}>
            Next Step
          </Button>
        </div>
      </Card>
    </div>
  );
}
