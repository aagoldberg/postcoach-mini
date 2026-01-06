'use client';

import { useState } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { CastAnalysis } from '@/types';

interface FeedbackCardProps {
  analysis: CastAnalysis;
  type: 'top' | 'bottom';
}

export function FeedbackCard({ analysis, type }: FeedbackCardProps) {
  const { cast, metrics, content, feedback, theme } = analysis;
  const [isExpanded, setIsExpanded] = useState(false);
  const isTop = type === 'top';

  return (
    <Card 
      className={`overflow-hidden bg-white border-none shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)] transition-all duration-500 ${isExpanded ? 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] scale-[1.01]' : 'hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] cursor-pointer'}`}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      <CardContent className="p-8">
        {/* Header: Signal & Meta (Always Visible) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isTop ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.3em]">{isTop ? 'High Signal' : 'Low Signal'}</span>
          </div>
          {theme && <Badge variant="default" className="bg-stone-50 border-stone-100 text-stone-400">{theme}</Badge>}
        </div>

        {/* Content Preview (Always Visible) */}
        <div className="mb-8">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-widest mb-3">Context</p>
          <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 font-medium italic border-l-2 border-stone-100 pl-4">
            &ldquo;{cast.text}&rdquo;
          </p>
        </div>

        {/* Analysis Headline (The Hook) */}
        {feedback && (
          <div className="space-y-6">
            <div>
              <p className="text-xl font-black text-[#1a1f2e] leading-tight tracking-tight serif-heading mb-4">
                {feedback.summary}
              </p>
              
              {!isExpanded && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-colors group"
                >
                  View Full Analysis
                  <svg className="w-3 h-3 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pt-4 border-t border-stone-50">
                <div className="grid grid-cols-1 gap-8">
                  {isTop ? (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-600 mb-4 tracking-[0.3em]">
                        Success Factors
                      </p>
                      <ul className="space-y-3">
                        {feedback.whatToReplicate.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                            <span className="text-base text-stone-600 font-medium leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-rose-600 mb-4 tracking-[0.3em]">
                        Friction Points
                      </p>
                      <ul className="space-y-3">
                        {feedback.whatToAvoid.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0"></span>
                            <span className="text-base text-stone-600 font-medium leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feedback.likelyCauses && feedback.likelyCauses.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-4 tracking-[0.3em]">
                        Environmental Context
                      </p>
                      <ul className="space-y-2">
                        {feedback.likelyCauses.map((item, idx) => (
                          <li key={idx} className="text-sm text-stone-400 font-medium italic leading-relaxed pl-4 border-l border-stone-100">
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
                  className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-all"
                >
                  Collapse Analysis
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
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
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[#1a1f2e] tracking-tighter serif-heading italic">
          {title}
        </h2>
        <p className="text-[10px] text-stone-400 mt-2 font-bold uppercase tracking-[0.4em]">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {analyses.map((analysis) => (
          <FeedbackCard key={analysis.cast.hash} analysis={analysis} type={type} />
        ))}
      </div>
    </section>
  );
}