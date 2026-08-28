'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/ui/CommandPalette';

interface NavItem {
  label: string;
  href: string;
}

const mainNav: NavItem[] = [
  { label: 'Executive Dashboard', href: '/dashboard' },
  { label: 'Worker Studio', href: '/studio' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Decisions', href: '/decisions' },
  { label: 'Executions', href: '/executions' },
  { label: 'Approvals', href: '/approvals' },
];

const domainNav: NavItem[] = [
  { label: 'Treasury & Cash', href: '/treasury' },
  { label: 'Revenue & Growth', href: '/revenue' },
  { label: 'Dynamic Pricing', href: '/pricing' },
  { label: 'Working Capital', href: '/working-capital' },
  { label: 'Procurement', href: '/procurement' },
  { label: 'Banking & Accounts', href: '/banking' },
  { label: 'Risk & Exposure', href: '/risk' },
  { label: 'Cash Forecasts', href: '/forecasts' },
  { label: 'Scenario Engine', href: '/scenarios' },
];

const settingsNav: NavItem[] = [
  { label: 'Organization', href: '/settings/organization' },
  { label: 'Users & Roles', href: '/settings/users' },
  { label: 'Policies', href: '/settings/policies' },
  { label: 'Integrations', href: '/settings/integrations' },
  { label: 'Credentials', href: '/settings/credentials' },
  { label: 'Audit Trail', href: '/settings/audit' },
];

export const Header: React.FC = () => {
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const commandItems = [
    { id: '1', title: 'Open Executive Command Center', category: 'NAV', action: () => (window.location.href = '/dashboard') },
    { id: '2', title: 'Launch Cash Optimization Worker', category: 'WORKER', action: () => (window.location.href = '/studio/workers') },
    { id: '3', title: 'View Identified Opportunities', category: 'FINANCE', action: () => (window.location.href = '/opportunities') },
    { id: '4', title: 'Review Pending CFO Approvals', category: 'APPROVALS', action: () => (window.location.href = '/approvals') },
  ];

  return (
    <>
      <header className="h-12 border-b border-[#1e2738] bg-[#111622] px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-mono font-bold text-xs text-white">
              S
            </div>
            <span className="font-bold text-sm tracking-wide text-slate-100 font-mono">
              UNCLE SCROOGE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded uppercase">
              Financial AI OS
            </span>
          </Link>

          <button
            onClick={() => setIsCmdOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#131926] border border-[#1e2738] rounded text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="font-mono text-[10px]">⌘K</span>
            <span>Search economic actions or workers...</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-[#131926] border border-[#1e2738] px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Northstar Holdings [DEMO DATA]</span>
          </div>
          <span className="text-slate-500">Eleanor Vance (CFO)</span>
        </div>
      </header>
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} items={commandItems} />
    </>
  );
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-[#1e2738] bg-[#0d121c] p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-6 overflow-y-auto pr-1">
        <div>
          <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            Core OS
          </div>
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const isActive = pathname === item.href || (item.href === '/studio' && pathname.startsWith('/studio'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-950/60 text-blue-400 border-l-2 border-blue-500 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131926]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            Financial Domains
          </div>
          <nav className="space-y-0.5">
            {domainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-950/60 text-blue-400 border-l-2 border-blue-500 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131926]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            Settings & Governance
          </div>
          <nav className="space-y-0.5">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-950/60 text-blue-400 border-l-2 border-blue-500 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131926]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-[#1e2738] text-[10px] font-mono text-slate-500 flex justify-between items-center">
        <span>Autonomy: LEVEL 2</span>
        <span className="text-emerald-400">ACTIVE</span>
      </div>
    </aside>
  );
};
