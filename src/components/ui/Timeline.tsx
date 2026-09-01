import React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  timestamp: string;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'PENDING';
  description?: string;
}

export const Timeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => {
  return (
    <div className="flex flex-col gap-4 border-l border-[#1e2738] pl-4 my-2">
      {items.map((item) => (
        <div key={item.id} className="relative">
          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#0b0e14]" />
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">{item.title}</span>
            <span className="text-[11px] font-mono text-slate-500">{item.timestamp}</span>
          </div>
          {item.description && <p className="text-xs text-slate-400 mt-1">{item.description}</p>}
        </div>
      ))}
    </div>
  );
};
