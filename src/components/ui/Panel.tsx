import React from 'react';

export const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[#111622] border border-[#1e2738] rounded p-4 mb-4">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 border-b border-[#1e2738] pb-2">
      {title}
    </h4>
    {children}
  </div>
);
