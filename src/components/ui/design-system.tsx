import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded';
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
      outline: 'border border-slate-700 text-slate-200 hover:bg-slate-800',
      danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm',
      ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// Input
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Select
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

// Card
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-sm text-slate-100', className)}>
      {children}
    </div>
  );
}

// Badge
export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const variants = {
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    danger: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
    info: 'bg-sky-950/60 text-sky-400 border-sky-800/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status Dot
export function StatusIndicator({ status }: { status: string }) {
  const getVariant = (s: string) => {
    switch (s.toUpperCase()) {
      case 'ACTIVE':
      case 'CONNECTED':
      case 'COMPLETED':
      case 'PASSED':
      case 'VERIFIED':
        return 'bg-emerald-500';
      case 'PENDING':
      case 'RUNNING':
      case 'WAITING_APPROVAL':
      case 'MONITORING':
        return 'bg-amber-500 animate-pulse';
      case 'FAILED':
      case 'ERROR':
      case 'REJECTED':
      case 'DISABLED':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  return <span className={cn('inline-block h-2 w-2 rounded-full', getVariant(status))} />;
}

// Metric Component
export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  return (
    <Card className={cn('flex flex-col justify-between gap-2', className)}>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</div>
      <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={cn('font-medium', trend.positive ? 'text-emerald-400' : 'text-rose-400')}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

// Table
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60">
      <table className={cn('w-full text-left text-sm text-slate-300', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-slate-800 bg-slate-950/80 text-xs font-medium uppercase text-slate-400">{children}</thead>;
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn('border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors', className)}>{children}</tr>;
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3">{children}</th>;
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>;
}

// Panel / Section
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-slate-800 bg-slate-900/80 p-5', className)}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// Dialog Modal
export function Dialog({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Drawer
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full border-l border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Tabs
export function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex space-x-1 border-b border-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.id
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Timeline
export function Timeline({
  items,
}: {
  items: { id: string; title: string; timestamp: string; status: string; description?: string }[];
}) {
  return (
    <div className="relative border-l border-slate-800 ml-3 space-y-6 py-2">
      {items.map((item) => (
        <div key={item.id} className="relative pl-6">
          <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border border-slate-900 bg-slate-700" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">{item.title}</span>
            <span className="text-xs text-slate-500">{item.timestamp}</span>
          </div>
          {item.description && <p className="text-xs text-slate-400 mt-1">{item.description}</p>}
        </div>
      ))}
    </div>
  );
}

// Empty State
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-slate-800 bg-slate-900/40 my-4">
      <div className="text-slate-500 font-semibold mb-1">{title}</div>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

// Loading State
export function LoadingState({ message = 'Loading domain data...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8 space-x-3 text-slate-400 text-sm">
      <span className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <span>{message}</span>
    </div>
  );
}

// Error State
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-rose-900/50 bg-rose-950/20 text-rose-300 my-4">
      <p className="text-sm font-medium mb-2">{message}</p>
      {retry && (
        <Button size="sm" variant="outline" onClick={retry}>
          Retry
        </Button>
      )}
    </div>
  );
}
