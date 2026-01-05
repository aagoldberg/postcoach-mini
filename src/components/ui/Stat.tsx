'use client';

interface StatProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function Stat({ label, value, subValue, trend, icon }: StatProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-zinc-500 dark:text-zinc-400',
  };

  return (
    <div className="flex flex-col p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
      {subValue && (
        <div className={`text-xs mt-1 ${trend ? trendColors[trend] : 'text-zinc-500 dark:text-zinc-400'}`}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {subValue}
        </div>
      )}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {children}
    </div>
  );
}
