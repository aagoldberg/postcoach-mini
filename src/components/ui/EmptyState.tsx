'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-stone-50/50 rounded-3xl border-2 border-dashed border-stone-200">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-6 text-stone-300">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-black text-[#1a1f2e] mb-2 serif-heading italic">
        {title}
      </h3>
      <p className="text-stone-500 max-w-xs mx-auto mb-6 font-medium leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}