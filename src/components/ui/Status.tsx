import React from 'react';
import { clsx } from 'clsx';

export interface StatusProps {
  type: 'READY' | 'ACTIVE' | 'NOT_CONFIGURED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'DISABLED' | 'WAITING_APPROVAL';
  text?: string;
}

export const Status: React.FC<StatusProps> = ({ type, text }) => {
  const config = {
    READY: { color: 'bg-emerald-500', label: text || 'READY' },
    ACTIVE: { color: 'bg-emerald-500', label: text || 'ACTIVE' },
    COMPLETED: { color: 'bg-emerald-500', label: text || 'COMPLETED' },
    RUNNING: { color: 'bg-blue-500 animate-pulse', label: text || 'RUNNING' },
    WAITING_APPROVAL: { color: 'bg-amber-500 animate-pulse', label: text || 'WAITING APPROVAL' },
    NOT_CONFIGURED: { color: 'bg-slate-500', label: text || 'NOT CONFIGURED' },
    FAILED: { color: 'bg-rose-500', label: text || 'FAILED' },
    DISABLED: { color: 'bg-slate-600', label: text || 'DISABLED' },
  }[type];

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-slate-300">
      <span className={clsx('w-2 h-2 rounded-full', config.color)} />
      <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">{config.label}</span>
    </div>
  );
};
