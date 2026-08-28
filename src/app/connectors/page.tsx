import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';
import { SUPPORTED_CONNECTORS, ConnectorService } from '@/lib/domain/connectors';
import { ShieldCheck, Database, Key, CheckCircle, AlertCircle } from 'lucide-react';

export const revalidate = 0;

export default async function ConnectorsHubPage() {
  const tenantId = 'tenant-northstar-001';

  const activeConnectors = await prisma.connector.findMany({
    where: { tenantId },
  });

  const activeTypes = new Set(activeConnectors.map((c) => c.type));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            ENTERPRISE CONNECTORS HUB
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Authenticated external data pipelines — Google Workspace, Financial APIs, ERPs & Relational Databases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Zero-Leak Credential Vault Enforced</Badge>
          <Badge variant="success">{activeConnectors.length} Active Connectors</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-1">
          <span className="text-slate-500 uppercase block text-[10px]">Credential Security Boundary</span>
          <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Server-Side Vault References
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Plaintext API keys, OAuth tokens, and connection strings are strictly isolated from client-side UI bundles.
          </p>
        </div>

        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-1">
          <span className="text-slate-500 uppercase block text-[10px]">Data Pipeline Status</span>
          <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Active Real-time Sync
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Continuous sync enabled for Google Sheets & Treasury Open APIs under tenant isolation boundaries.
          </p>
        </div>

        <div className="p-4 bg-[#111622] border border-[#1e2738] rounded space-y-1">
          <span className="text-slate-500 uppercase block text-[10px]">Available Enterprise Adapters</span>
          <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            7 Supported Connectors
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Google Drive, Sheets, Gmail, PostgreSQL, Bank MTLS API, SAP ERP, and File Streams.
          </p>
        </div>
      </div>

      <Card title="Active Enterprise Integrations & Credentials">
        <Table
          headers={['Connector Name', 'Category', 'Type', 'Status', 'Vault Credential Reference']}
          rows={activeConnectors.map((conn) => [
            <span key="name" className="font-bold text-slate-200">{conn.name}</span>,
            <Badge key="cat" variant="info">{conn.category}</Badge>,
            <Badge key="t" variant="neutral">{conn.type}</Badge>,
            <Status key="s" type={conn.status as any} />,
            <span key="ref" className="font-mono text-slate-400 text-xs">
              {ConnectorService.getSafeCredentialSummary(conn.credentialReference)}
            </span>,
          ])}
        />
      </Card>

      <Card title="Supported Platform Connector Adapters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {SUPPORTED_CONNECTORS.map((def) => {
            const isConfigured = activeTypes.has(def.type);

            return (
              <div
                key={def.type}
                className={`p-4 border rounded flex flex-col justify-between transition-all ${
                  isConfigured ? 'bg-[#111622] border-emerald-500/40' : 'bg-[#0b0e14] border-[#1e2738] opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-200 text-sm">{def.name}</span>
                    <Badge variant={isConfigured ? 'success' : 'neutral'}>{def.category}</Badge>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{def.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e2738] text-[11px] space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Authentication Method:</span>
                    <span className="text-slate-200 font-semibold">{def.authMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Integration Status:</span>
                    {isConfigured ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> CONNECTED
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> NOT_CONNECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
