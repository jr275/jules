import React from 'react';
import Link from 'next/link';

const SETTINGS_NAV = [
  { name: 'Organization & Entities', href: '/settings/organization' },
  { name: 'Users & Roles', href: '/settings/users' },
  { name: 'Policies & Authorization', href: '/settings/policies' },
  { name: 'Connectors & Integrations', href: '/settings/integrations' },
  { name: 'Credentials Vault', href: '/settings/credentials' },
  { name: 'Audit Log & Traceability', href: '/settings/audit' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white">System Settings & Governance</h1>
        <p className="text-xs text-slate-400 mt-1">Tenant boundary, security policies, credentials vault, and audit trail</p>
      </div>

      <div className="flex border-b border-slate-800 space-x-4 overflow-x-auto">
        {SETTINGS_NAV.map((nav) => (
          <Link
            key={nav.href}
            href={nav.href}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:border-b-2 hover:border-emerald-500 transition-colors whitespace-nowrap"
          >
            {nav.name}
          </Link>
        ))}
      </div>

      <div>{children}</div>
    </div>
  );
}
