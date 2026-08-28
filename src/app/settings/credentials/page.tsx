import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function CredentialsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">CREDENTIAL VAULT BOUNDARY</h1>
          <p className="text-xs text-slate-400 mt-1">Zero secret exposure guarantee — Credentials stored by reference key only</p>
        </div>
        <Badge variant="success">VAULT ENCRYPTION ACTIVE</Badge>
      </div>

      <Card title="Vault Managed Credential References">
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-200 block">cred-sap-01</span>
              <span className="text-slate-500">SAP S/4HANA ERP Key Reference</span>
            </div>
            <Badge variant="success">CONNECTED</Badge>
          </div>
          <div className="p-3 bg-[#111622] border border-[#1e2738] rounded flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-200 block">cred-jpm-01</span>
              <span className="text-slate-500">JPMorgan Chase Treasury API Key Reference</span>
            </div>
            <Badge variant="success">CONNECTED</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
