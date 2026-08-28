import React from 'react';
import { prisma } from '@/lib/db';
import { Card, Badge, Button } from '@/components/ui/design-system';
import { CheckSquare, Check, X } from 'lucide-react';

export const revalidate = 0;

export default async function ApprovalsPage() {
  const actions = await prisma.action.findMany({
    where: { approvalStatus: 'PENDING' },
    include: { decision: true, entity: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            Governance & Human-in-the-Loop Approvals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic policy review requests requiring executive authorization prior to execution
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm border border-slate-800 rounded-lg bg-slate-900/60">
            No pending financial authorizations required.
          </div>
        ) : (
          actions.map((act) => (
            <Card key={act.id} className="p-5 border-amber-900/40 bg-slate-900/90 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="warning">ACTION APPROVAL REQUIRED — CFO ROLE</Badge>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  ${act.amount.toLocaleString()} {act.currency}
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-1">{act.type}</h3>
                <p className="text-xs text-slate-400">Target: {act.target}</p>
                {act.decision && (
                  <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
                    <span className="text-emerald-400">RATIONALE: </span>
                    {act.decision.recommendation}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <Button size="sm" variant="danger" className="gap-1">
                  <X className="h-4 w-4" /> Reject Action
                </Button>
                <Button size="sm" variant="primary" className="gap-1">
                  <Check className="h-4 w-4" /> Approve Execution
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
