import React from 'react';
import { prisma } from '@/lib/db';
import { Card, Badge } from '@/components/ui/design-system';
import { GitPullRequest } from 'lucide-react';

export const revalidate = 0;

export default async function DecisionsPage() {
  const decisions = await prisma.decision.findMany({
    orderBy: { createdAt: 'desc' },
    include: { actions: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 text-emerald-400" />
            Autonomous Decision Audit & Traceability
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explainable decision records with evidence, assumptions, trade-offs, and policy evaluation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {decisions.map((dec) => (
          <Card key={dec.id} className="p-5 border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={dec.policyStatus === 'PASSED' ? 'success' : 'danger'}>
                  POLICY: {dec.policyStatus}
                </Badge>
                <Badge variant="neutral">RISK: {dec.risk}</Badge>
              </div>
              <span className="font-mono text-sm text-emerald-400 font-bold">
                Impact: ${dec.economicImpact.toLocaleString()}
              </span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-1">{dec.recommendation}</h3>
              <p className="text-xs text-slate-400">{dec.problem}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-semibold block">EVIDENCE:</span>
                <span className="text-slate-300">{dec.evidence}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">ASSUMPTIONS:</span>
                <span className="text-slate-300">{dec.assumptions}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">ALTERNATIVES:</span>
                <span className="text-slate-300">{dec.alternatives}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800/80">
              <span className="text-slate-500 font-mono">Approval: {dec.approvalStatus}</span>
              <span className="text-slate-500 font-mono">Execution: {dec.executionStatus}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
