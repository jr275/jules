'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b border-[#1e2738] gap-6 text-xs font-medium">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'pb-2.5 relative transition-colors flex items-center gap-2',
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.2 bg-[#1e2738] text-[10px] text-slate-300 rounded font-mono">
                {tab.badge}
              </span>
            )}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t" />}
          </button>
        );
      })}
    </div>
  );
};
