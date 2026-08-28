'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  TrendingUp,
  GitPullRequest,
  PlayCircle,
  CheckSquare,
  Landmark,
  DollarSign,
  Tag,
  Briefcase,
  ShoppingBag,
  Building2,
  ShieldAlert,
  LineChart,
  Sliders,
  Settings,
  Search,
  Sparkles,
} from 'lucide-react';
import { cn, Badge } from '@/components/ui/design-system';
import { CommandPalette } from '@/components/ui/command-palette';

const NAV_GROUPS = [
  {
    title: 'OPERATIONAL COMMAND',
    items: [
      { name: 'Executive Center', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Worker Studio', href: '/studio', icon: Cpu },
      { name: 'Opportunities', href: '/opportunities', icon: TrendingUp },
      { name: 'Decisions', href: '/decisions', icon: GitPullRequest },
      { name: 'Executions', href: '/executions', icon: PlayCircle },
      { name: 'Approvals', href: '/approvals', icon: CheckSquare },
    ],
  },
  {
    title: 'FINANCIAL DOMAINS',
    items: [
      { name: 'Treasury', href: '/treasury', icon: Landmark },
      { name: 'Revenue', href: '/revenue', icon: DollarSign },
      { name: 'Pricing', href: '/pricing', icon: Tag },
      { name: 'Working Capital', href: '/working-capital', icon: Briefcase },
      { name: 'Procurement', href: '/procurement', icon: ShoppingBag },
      { name: 'Banking', href: '/banking', icon: Building2 },
      { name: 'Risk', href: '/risk', icon: ShieldAlert },
      { name: 'Forecasts', href: '/forecasts', icon: LineChart },
      { name: 'Scenarios', href: '/scenarios', icon: Sliders },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { name: 'Settings & Security', href: '/settings/organization', icon: Settings },
    ],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <CommandPalette />

      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-slate-100 group-hover:text-emerald-400 transition-colors uppercase">
                UNCLE SCROOGE
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                FINANCIAL AI OS
              </span>
            </div>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800 ml-2" />
          <Badge variant="warning" className="text-[10px] uppercase font-mono">
            DEMO DATA — NORTHSTAR HOLDINGS
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 h-8 px-3 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search or command...</span>
            <kbd className="text-[10px] font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400 ml-2">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-medium">Ebenezer Vance</span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
              CFO
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 border-r border-slate-800 bg-slate-950/60 flex flex-col shrink-0 p-3 overflow-y-auto">
          <nav className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-400' : 'text-slate-500')} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
