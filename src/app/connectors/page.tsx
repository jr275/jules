import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Status } from '@/components/ui/Status';
import { SUPPORTED_CONNECTORS } from '@/lib/domain/connectors';

export const revalidate = 0;

export default async function ConnectorsHubPage() {
  const tenantId = 'tenant-northstar-001';

  const activeConnectors = await prisma.connector.findMany({
    where: { tenantId },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">SYSTEM CONNECTORS HUB</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authenticated external integrations — Google Workspace, Microsoft 365, Banking APIs, and ERP Systems
          </p>
        </div>
        <Badge variant="info">Zero Secret Exposure Vault</Badge>
      </div>

      <Card title="Active System Connectors">
        <Table
          headers={['Connector Name', 'Category', 'Type', 'Status', 'Credential Reference']}
          rows={activeConnectors.map((conn) => [
            conn.name,
            <Badge key="cat" variant="info">{conn.category}</Badge>,
            <Badge key="t" variant="neutral">{conn.type}</Badge>,
            <Status key="s" type={conn.status as any} />,
            <span key="ref" className="font-mono text-slate-400 text-xs">{conn.credentialReference || 'Vault Reference'}</span>,
          ])}
        />
      </Card>

      <Card title="Available Platform Connector Framework">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORTED_CONNECTORS.map((def) => (
            <div key={def.type} className="p-4 bg-[#111622] border border-[#1e2738] rounded">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">{def.name}</span>
                <Badge variant="neutral">{def.category}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">{def.description}</p>
              <div className="mt-2 pt-2 border-t border-[#1e2738] text-[11px] font-mono text-slate-500 flex justify-between">
                <span>Auth: {def.authMethod}</span>
                <span className="text-emerald-400">AVAILABLE</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
