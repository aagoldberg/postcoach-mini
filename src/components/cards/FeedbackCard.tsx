'use client';

import { useState } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { CastAnalysis } from '@/types';

interface FeedbackCardProps {
  analysis: CastAnalysis;
  type: 'top' | 'bottom';
}

const GENERIC_LABELS = ['All Posts', 'Mixed Topics'];

export function FeedbackCard({ analysis, type }: FeedbackCardProps) {
  const { cast, metrics, content, feedback, theme } = analysis;
  const [isExpanded, setIsExpanded] = useState(false);
  const isTop = type === 'top';
  const showTheme = theme && !GENERIC_LABELS.includes(theme);

  return (
    <Card 
      className={`overflow-hidden bg-white border-none shadow-[0_5px_15px_-5px_rgba(0,0,0,0.03)] transition-all duration-300 ${isExpanded ? 'shadow-lg scale-[1.01]' : 'active:scale-[0.99]'}`}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isTop ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} shadow-sm`} />
            <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{isTop ? 'High Signal' : 'Low Signal'}</span>
          </div>
          {showTheme && <Badge variant="default" className="text-[9px] px-2 py-0.5 bg-stone-50 border-stone-100 text-stone-400">{theme}</Badge>}
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-stone-600 text-xs font-medium leading-relaxed line-clamp-2 pl-3 border-l-2 border-stone-100 italic">
            &ldquo;{cast.text}&rdquo;
          </p>
        </div>

        {/* Analysis Headline */}
        {feedback && (
          <div className="space-y-4">
            <div>
              <p className="text-base font-black text-[#1a1f2e] leading-tight tracking-tight serif-heading">
                {feedback.summary}
              </p>
              
              {!isExpanded && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="w-full py-2.5 mt-3 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Analyze
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-3 border-t border-stone-50">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className={`text-[9px] uppercase font-bold mb-2 tracking-widest ${isTop ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isTop ? 'Success Factors' : 'Friction Points'}
                    </p>
                    <ul className="space-y-2">
                      {(isTop ? feedback.whatToReplicate : feedback.whatToAvoid).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${isTop ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span className="text-xs text-stone-600 font-medium leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {feedback.likelyCauses && feedback.likelyCauses.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-2 tracking-widest">
                        Context
                      </p>
                      <ul className="space-y-1.5">
                        {feedback.likelyCauses.map((item, idx) => (
                          <li key={idx} className="text-xs text-stone-400 font-medium italic leading-relaxed pl-2 border-l border-stone-100">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="w-full py-2.5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all"
                >
                  Close
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FeedbackSectionProps {
  title: string;
  description: string;
  analyses: CastAnalysis[];
  type: 'top' | 'bottom';
}

export function FeedbackSection({ title, description, analyses, type }: FeedbackSectionProps) {
  return (
    <section>
      <div className="mb-4 px-1">
        <h2 className="text-base font-black text-[#1a1f2e] tracking-tight serif-heading italic">
          {title}
        </h2>
        <p className="text-[9px] text-stone-400 mt-1 font-bold uppercase tracking-widest">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {analyses.map((analysis) => (
          <FeedbackCard key={analysis.cast.hash} analysis={analysis} type={type} />
        ))}
      </div>
    </section>
  );
}
