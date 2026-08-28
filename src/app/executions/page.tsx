import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge, StatusIndicator } from '@/components/ui/design-system';
import { PlayCircle } from 'lucide-react';

export const revalidate = 0;

export default async function ExecutionsPage() {
  const executions = await prisma.execution.findMany({
    orderBy: { createdAt: 'desc' },
    include: { worker: true, steps: true, entity: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-emerald-400" />
            Worker Execution Lifecycle
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time execution telemetry, step-by-step state machine, and error handling
          </p>
        </div>
      </div>

      <Panel title={`Execution Runs (${executions.length})`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Execution ID</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {executions.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell className="font-mono text-xs text-slate-300">{ex.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium text-slate-200">{ex.worker.name}</TableCell>
                <TableCell className="text-xs text-slate-400">{ex.entity.name}</TableCell>
                <TableCell>
                  <Badge variant="neutral">{ex.trigger}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400">
                  {ex.steps.length} steps completed
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={ex.status} />
                    <Badge variant={ex.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {ex.status}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
