import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';

export const revalidate = 0;

export default async function CredentialsSettingsPage() {
  const credentials = await prisma.credential.findMany();

  return (
    <div className="space-y-6">
      <Panel title="Secure Credentials Vault Pointer References">
        <p className="text-xs text-slate-400 mb-4">
          Strict Security Boundary: Plaintext secrets and API keys are stored in an isolated KMS/Vault. Only opaque references are stored or processed by application domain records.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Credential Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vault Reference Identifier</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {credentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell className="font-medium text-slate-200">{cred.name}</TableCell>
                <TableCell><Badge variant="neutral">{cred.type}</Badge></TableCell>
                <TableCell className="font-mono text-xs text-emerald-400">{cred.reference}</TableCell>
                <TableCell><Badge variant="success">{cred.status}</Badge></TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
