import React from 'react';
import { prisma } from '@/lib/db';
import { Panel, Table, TableHeader, TableRow, TableHead, TableCell, Badge } from '@/components/ui/design-system';

export const revalidate = 0;

export default async function UsersSettingsPage() {
  const users = await prisma.user.findMany();

  return (
    <div className="space-y-6">
      <Panel title="Active System Users & Role Authorization">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-slate-200">{u.name}</TableCell>
                <TableCell className="font-mono text-xs text-slate-400">{u.email}</TableCell>
                <TableCell><Badge variant="warning">{u.role}</Badge></TableCell>
                <TableCell><Badge variant="success">{u.status}</Badge></TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
