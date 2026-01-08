'use client';

import { useRef, useCallback, useState } from 'react';
import { Card, CardContent, Button, Toast } from '@/components/ui';
import type { WeeklyBrief as WeeklyBriefType } from '@/types';

interface WeeklyBriefProps {
  brief: WeeklyBriefType;
  username: string;
  onShareImage?: () => void;
}

export function WeeklyBrief({ brief, username, onShareImage }: WeeklyBriefProps) {
  const briefRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'win' | 'weakness' | 'experiment'>('experiment');

  const copyToClipboard = useCallback(() => {
    const text = `My PostCoach Brief: ${brief.experiment.title}\n\nTry: \"${brief.experiment.templateCast}\"`;
    navigator.clipboard.writeText(text).then(() => setToast('Brief copied!'));
  }, [brief]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-black text-[#1a1f2e] tracking-tight serif-heading italic">
          Action Plan
        </h2>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900">
            Copy
          </button>
          {onShareImage && (
            <button onClick={onShareImage} className="text-[10px] font-bold uppercase tracking-wider text-[#1a1f2e] hover:text-indigo-600">
              Share
            </button>
          )}
        </div>
      </div>

      <div ref={briefRef} id="weekly-brief-card">
        <Card className="overflow-hidden shadow-sm">
          {/* Header Compact */}
          <div className="px-5 py-4 bg-stone-50/50 border-b border-stone-100 flex justify-between items-center">
             <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
               {new Date(brief.periodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
             </span>
             <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">
               REV {new Date().getFullYear()}
             </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-100">
            <button 
              onClick={() => setActiveTab('win')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'win' ? 'text-emerald-600 bg-emerald-50/30 border-b-2 border-emerald-500' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Win
            </button>
            <button 
              onClick={() => setActiveTab('weakness')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'weakness' ? 'text-rose-600 bg-rose-50/30 border-b-2 border-rose-500' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Gap
            </button>
            <button 
              onClick={() => setActiveTab('experiment')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'experiment' ? 'text-indigo-600 bg-indigo-50/30 border-b-2 border-indigo-500' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Do This
            </button>
          </div>

          <CardContent className="p-5 min-h-[220px]">
            {activeTab === 'win' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Top Strength</span>
                </div>
                <h3 className="text-lg font-black text-[#1a1f2e] leading-tight mb-2">
                  {brief.win.title}
                </h3>
                <p className="text-sm text-stone-600 font-medium leading-relaxed mb-4">
                  {brief.win.description}
                </p>
                <div className="inline-flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                   <span className="text-[9px] font-bold text-stone-400 uppercase">{brief.win.metric}</span>
                   <span className="text-sm font-black text-[#1a1f2e]">{brief.win.value}</span>
                </div>
              </div>
            )}

            {activeTab === 'weakness' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                   <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Opportunity</span>
                </div>
                <h3 className="text-lg font-black text-[#1a1f2e] leading-tight mb-2">
                  {brief.weakness.title}
                </h3>
                <p className="text-sm text-stone-600 font-medium leading-relaxed mb-4">
                  {brief.weakness.description}
                </p>
                <div className="inline-flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                   <span className="text-[9px] font-bold text-stone-400 uppercase">{brief.weakness.metric}</span>
                   <span className="text-sm font-black text-[#1a1f2e]">{brief.weakness.value}</span>
                </div>
              </div>
            )}

            {activeTab === 'experiment' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Experiment</span>
                </div>
                <h3 className="text-lg font-black text-[#1a1f2e] leading-tight mb-3">
                  {brief.experiment.title}
                </h3>
                
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 relative">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Try Posting:</p>
                  <p className="text-base text-[#1a1f2e] font-serif italic leading-relaxed">
                    &ldquo;{brief.experiment.templateCast}&rdquo;
                  </p>
                </div>
                
                <p className="mt-3 text-[10px] text-stone-400 font-bold leading-normal">
                  <span className="uppercase tracking-widest text-stone-300">Why:</span> {brief.experiment.rationale}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
