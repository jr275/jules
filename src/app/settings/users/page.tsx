import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

export const revalidate = 0;

export default async function UsersSettingsPage() {
  const tenantId = 'tenant-northstar-001';
  const users = await prisma.user.findMany({ where: { tenantId } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">USERS & ENTERPRISE ROLES</h1>
          <p className="text-xs text-slate-400 mt-1">Role-based access management and security boundaries</p>
        </div>
        <Badge variant="info">Northstar Holdings [DEMO DATA]</Badge>
      </div>

      <Card title="Tenant Authorized Users">
        <Table
          headers={['User Name', 'Email Address', 'Enterprise Role', 'Status']}
          rows={users.map((r) => [
            r.name,
            <span key="em" className="font-mono">{r.email}</span>,
            <Badge key="role" variant="info">{r.role}</Badge>,
            <Badge key="stat" variant="success">{r.status}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
}
