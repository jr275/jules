import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, action, children, className }) => {
  return (
    <div className={clsx('bg-[#131926] border border-[#1e2738] rounded overflow-hidden', className)}>
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-[#1e2738] flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
