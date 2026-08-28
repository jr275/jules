import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Panel, Card, Badge, StatusIndicator, Button, Table, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/design-system';
import { Cpu, Plus, Zap, ChevronRight } from 'lucide-react';

export const revalidate = 0;

export default async function StudioPage() {
  const workers = await prisma.worker.findMany({
    include: {
      workerSkills: {
        include: { skill: true },
      },
    },
  });

  const skills = await prisma.skill.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-400" />
            Worker Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure autonomous financial operating units, skills, tools, policies, and autonomy levels
          </p>
        </div>
        <Link href="/studio/workers">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Worker Instance
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workers.map((worker) => (
          <Card key={worker.id} className="flex flex-col justify-between space-y-4 border-slate-800 bg-slate-900/90">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusIndicator status={worker.status} />
                  <span className="font-semibold text-base text-white">{worker.name}</span>
                </div>
                <Badge variant="info" className="font-mono text-[10px]">
                  {worker.autonomyLevel}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mb-4">{worker.description}</p>
              <div className="text-xs font-mono text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-800 mb-4">
                <span className="text-emerald-400 font-semibold">PURPOSE: </span>
                {worker.purpose}
              </div>

              <div>
                <div className="text-[10px] uppercase font-mono font-semibold text-slate-500 mb-2">
                  Active Capabilities & Skills ({worker.workerSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {worker.workerSkills.map((ws) => (
                    <Badge key={ws.skill.id} variant="neutral" className="text-[10px]">
                      <Zap className="h-3 w-3 text-emerald-400 mr-1 inline" />
                      {ws.skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Status: {worker.status}</span>
              <Link href={`/studio/workers?id=${worker.id}`} className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                Configure Worker <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Panel title="Available Enterprise Capabilities & Skills Library">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Autonomy Cap</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {skills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell className="font-medium text-slate-200">{skill.name}</TableCell>
                <TableCell>
                  <Badge variant="neutral">{skill.category}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{skill.version}</TableCell>
                <TableCell>
                  <Badge variant={skill.riskLevel === 'LOW' ? 'success' : 'warning'}>{skill.riskLevel}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400">{skill.autonomyLevel}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
