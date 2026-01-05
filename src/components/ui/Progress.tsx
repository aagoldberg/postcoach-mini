'use client';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

export function Progress({
  value,
  max = 100,
  label,
  showPercentage = false,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function LoadingProgress({ stage, progress }: { stage: string; progress: number }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <Progress value={progress} showPercentage />
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-3 animate-pulse">
        {stage}
      </p>
    </div>
  );
}
