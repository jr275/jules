import React from 'react';

export interface MetricProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
}

export const Metric: React.FC<MetricProps> = ({ label, value, change, isPositive, subtext }) => {
  return (
    <div className="bg-[#131926] border border-[#1e2738] rounded p-4 flex flex-col justify-between">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="my-2 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold font-mono text-slate-100">{value}</span>
        {change && (
          <span
            className={`text-xs font-mono font-medium ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}{change}
          </span>
        )}
      </div>
      {subtext && <span className="text-[11px] text-slate-500">{subtext}</span>}
    </div>
  );
};
