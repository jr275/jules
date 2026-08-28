import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function KnowledgePage() {
  const tenantId = 'tenant-northstar-001';

  const knowledgeSources = await prisma.knowledgeSource.findMany({
    where: { tenantId },
    include: { connector: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">KNOWLEDGE SOURCES & PROVENANCE</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected spreadsheets, drive folders, database tables, and financial documents with explicit provenance
          </p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Connected Knowledge Sources">
        <Table
          headers={['Knowledge Source', 'Type', 'Connected Connector', 'Resource URI', 'Status']}
          rows={knowledgeSources.map((ks) => [
            ks.name,
            <Badge key="t" variant="info">{ks.type}</Badge>,
            <span key="c" className="font-mono text-xs text-blue-400">{ks.connector?.name || 'Direct Import'}</span>,
            <span key="u" className="font-mono text-slate-400 text-xs truncate max-w-xs block">{ks.uri}</span>,
            <Badge key="s" variant="success">{ks.status}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
}
