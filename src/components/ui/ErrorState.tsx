'use client';

import React from 'react';

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="border border-rose-900/50 bg-rose-950/20 rounded p-4 my-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-rose-400 font-bold">!</span>
      <span className="text-xs text-rose-300 font-mono">{message}</span>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="text-xs text-rose-400 hover:text-rose-200 underline font-mono">
        Retry
      </button>
    )}
  </div>
);
