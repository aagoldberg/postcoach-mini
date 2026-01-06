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
    <div className="flex flex-col p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
        {subValue && (
          <span className={`text-[10px] ${trend ? trendColors[trend] : 'text-zinc-400'}`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {children}
    </div>
  );
}
