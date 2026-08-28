import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ROLE_PERMISSIONS } from '@/lib/domain/auth';

export default function RolesSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2738] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">ROLE PERMISSION MATRIX</h1>
          <p className="text-xs text-slate-400 mt-1">Fine-grained permission mappings enforced server-side</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
          <Card key={role} title={`Role: ${role}`}>
            <div className="flex flex-wrap gap-1.5">
              {perms.map((p) => (
                <Badge key={p} variant="neutral">{p}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
