'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight } from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  href: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: '1', title: 'Executive Command Center', category: 'Overview', href: '/dashboard' },
  { id: '2', title: 'Worker Studio', category: 'Studio', href: '/studio' },
  { id: '3', title: 'Opportunities', category: 'Intelligence', href: '/opportunities' },
  { id: '4', title: 'Decisions', category: 'Intelligence', href: '/decisions' },
  { id: '5', title: 'Executions', category: 'Execution', href: '/executions' },
  { id: '6', title: 'Approvals', category: 'Governance', href: '/approvals' },
  { id: '7', title: 'Treasury Optimization', category: 'Domain', href: '/treasury' },
  { id: '8', title: 'Revenue Optimization', category: 'Domain', href: '/revenue' },
  { id: '9', title: 'Dynamic Pricing', category: 'Domain', href: '/pricing' },
  { id: '10', title: 'Working Capital', category: 'Domain', href: '/working-capital' },
  { id: '11', title: 'Procurement Yield', category: 'Domain', href: '/procurement' },
  { id: '12', title: 'Banking Intelligence', category: 'Domain', href: '/banking' },
  { id: '13', title: 'Risk Intelligence', category: 'Domain', href: '/risk' },
  { id: '14', title: 'Liquidity Forecasts', category: 'Domain', href: '/forecasts' },
  { id: '15', title: 'Scenario Simulator', category: 'Domain', href: '/scenarios' },
  { id: '16', title: 'Organization Settings', category: 'Settings', href: '/settings/organization' },
  { id: '17', title: 'Policies & Authorization', category: 'Settings', href: '/settings/policies' },
  { id: '18', title: 'Audit Trail', category: 'Settings', href: '/settings/audit' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, workers, routes (⌘K)..."
            className="w-full bg-transparent py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <kbd className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Command className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400" />
                  <span>{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
