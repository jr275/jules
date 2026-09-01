import React from 'react';

export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="border border-[#1e2738] rounded bg-[#111622] p-8 text-center flex flex-col items-center justify-center my-4">
    <div className="w-10 h-10 rounded-full bg-[#1e2738] flex items-center justify-center text-slate-400 mb-3 text-lg font-mono">
      Ø
    </div>
    <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
    <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
    {action}
  </div>
);
