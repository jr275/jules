import React from 'react';
import { AgentBuilder } from '@/components/agent/AgentBuilder';
import { Badge } from '@/components/ui/Badge';

export default function NewAgentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">CREATE SPECIALIZED AI AGENT</h1>
          <p className="text-xs text-slate-400 mt-1">Guided Agent Builder — Configure purpose, skills, connectors, policies, and autonomy</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>
      <AgentBuilder />
    </div>
  );
}
