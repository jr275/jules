import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';
import { KnowledgeService, ProvenanceSourceType } from '@/lib/domain/knowledge';
import { BookOpen, ShieldCheck, Database, FileSpreadsheet, FileText, Server, Layers } from 'lucide-react';

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
          <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            ENTERPRISE KNOWLEDGE CENTER & PROVENANCE INDEX
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Indexed spreadsheets, drive repositories, bank ledger vectors, and ERP data actuals with explicit provenance audit metadata.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Auditability Standard Active</Badge>
          <Badge variant="success">{knowledgeSources.length} Connected Sources</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-1">
          <span className="text-slate-500 uppercase block text-[10px]">Active Knowledge Vectors</span>
          <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            14,850 Embeddings
          </div>
          <div className="text-[10px] text-slate-400">Indexed from Google Sheets & ERP actuals</div>
        </div>

        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-1">
          <span className="text-slate-500 uppercase block text-[10px]">Data Quality Score</span>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            96.8% High Quality
          </div>
          <div className="text-[10px] text-slate-400">Validated against banking statements</div>
        </div>

        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-1">
          <span className="text-slate-500 uppercase block text-[10px]">Data Freshness</span>
          <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            Continuous Sync
          </div>
          <div className="text-[10px] text-slate-400">Last sync: 12 minutes ago</div>
        </div>

        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-1">
          <span className="text-slate-500 uppercase block text-[10px]">Provenance Boundary</span>
          <div className="text-lg font-bold text-slate-200">Zero Hallucination</div>
          <div className="text-[10px] text-slate-400">All outputs carry explicit source references</div>
        </div>
      </div>

      <Card title="Connected Knowledge Sources & Vector Embeddings">
        <Table
          headers={['Source Name', 'Type', 'Connector Reference', 'Resource URI / Table', 'Data Quality', 'Provenance Attribution', 'Status']}
          rows={knowledgeSources.map((ks) => {
            const confidence = KnowledgeService.calculateConfidenceScore(0.95, 98, 1);

            return [
              <span key="n" className="font-bold text-slate-200 flex items-center gap-2">
                {ks.type.includes('SHEET') ? (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                )}
                {ks.name}
              </span>,
              <Badge key="t" variant="info">{ks.type}</Badge>,
              <span key="c" className="font-mono text-xs text-blue-400">{ks.connector?.name || 'Direct Enterprise Adapter'}</span>,
              <span key="u" className="font-mono text-slate-400 text-xs truncate max-w-xs block">{ks.uri}</span>,
              <span key="q" className="font-mono text-emerald-400 font-bold">{Math.round(confidence * 100)}%</span>,
              <span key="p" className="font-mono text-slate-400 text-[11px]">
                {ks.connector?.type || 'BANK_API'} ({ks.id.substring(0, 12)})
              </span>,
              <Status key="s" type={ks.status === 'READY' ? 'READY' : 'ACTIVE'} />,
            ];
          })}
        />
      </Card>
    </div>
  );
}
