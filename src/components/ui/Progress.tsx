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
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1a1f2e] rounded-full transition-all duration-500 ease-out"
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
      <p className="text-center text-xs font-bold text-stone-500 uppercase tracking-widest mt-4 animate-pulse">
        {stage}
      </p>
    </div>
  );
}