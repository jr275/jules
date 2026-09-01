import React from 'react';

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading autonomous financial metrics...' }) => (
  <div className="py-12 flex flex-col items-center justify-center gap-3">
    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-slate-400 font-mono">{label}</span>
  </div>
);
