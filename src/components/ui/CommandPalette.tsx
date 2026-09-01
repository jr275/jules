'use client';

import React, { useState } from 'react';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  action: () => void;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void; items: CommandItem[] }> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-[#131926] border border-[#1e2738] rounded-lg shadow-2xl overflow-hidden">
        <div className="p-3 border-b border-[#1e2738] flex items-center gap-2">
          <span className="text-slate-400 font-mono text-xs">⌘</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search economic actions, workers, decisions, opportunities..."
            className="w-full bg-transparent text-sm text-slate-200 focus:outline-none"
          />
          <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300 font-mono">
            ESC
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#1e2738]/50">
          {filtered.length === 0 ? (
            <div className="p-4 text-xs text-slate-500 text-center font-mono">No matching financial commands</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="p-2.5 rounded hover:bg-[#171f30] cursor-pointer flex items-center justify-between text-xs"
              >
                <span className="text-slate-200 font-medium">{item.title}</span>
                <span className="text-[10px] font-mono uppercase bg-[#1e2738] px-2 py-0.5 rounded text-slate-400">
                  {item.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
