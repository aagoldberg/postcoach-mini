'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-stone-50 text-stone-400 border border-stone-100',
    success: 'bg-emerald-50/50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50/50 text-amber-700 border border-amber-100',
    error: 'bg-rose-50/50 text-rose-700 border border-rose-100',
    info: 'bg-[#4b5e54]/10 text-[#4b5e54] border border-[#4b5e54]/20',
  };

  const sizes = {
    sm: 'px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
    md: 'px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}