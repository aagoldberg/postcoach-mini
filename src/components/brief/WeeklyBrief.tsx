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

  const copyToClipboard = useCallback(() => {
    const formatText = brief.experiment.templateCast || '';
    
    const text = `My Tune Weekly Brief

WIN: ${brief.win.title}
${brief.win.description}
${brief.win.metric}: ${brief.win.value}

WEAKNESS: ${brief.weakness.title}
${brief.weakness.description}
${brief.weakness.metric}: ${brief.weakness.value}

EXPERIMENT: ${brief.experiment.title}
${brief.experiment.description}

Format: ${formatText}
Why: ${brief.experiment.rationale}

Generated with Tune`;

    navigator.clipboard.writeText(text).then(() => {
      setToast('Brief copied to clipboard!');
    });
  }, [brief]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Your Brief
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Based on your last 30 days
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            Copy Text
          </Button>
          {onShareImage && (
            <Button variant="primary" size="sm" onClick={onShareImage}>
              Share as Image
            </Button>
          )}
        </div>
      </div>

      <div ref={briefRef} id="weekly-brief-card">
        <Card className="overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)]">
          <div className="p-8 pb-4 border-b border-stone-50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.3em]">@{username}</span>
              <span className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.3em]">
                {new Date(brief.periodStart).toLocaleDateString()} — {new Date(brief.periodEnd).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-4xl font-black text-[#1a1f2e] tracking-tighter serif-heading mb-1">The Brief</h3>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Based on your last 30 days of activity</p>
          </div>

          <CardContent className="p-0 bg-white">
            {/* Win Section */}
            <div className="p-8 border-b border-stone-50">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.25em]">
                      The Performance Win
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-[#1a1f2e] tracking-tight mb-2">
                    {brief.win.title}
                  </h4>
                  <p className="text-base text-stone-500 mb-4 leading-relaxed font-medium">
                    {brief.win.description}
                  </p>
                  <div className="inline-flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      {brief.win.metric}:
                    </span>
                    <span className="text-base font-black text-emerald-600 tracking-tighter">
                      {brief.win.value}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weakness Section */}
            <div className="p-8 border-b border-stone-50">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.25em]">
                      The Opportunity
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-[#1a1f2e] tracking-tight mb-2">
                    {brief.weakness.title}
                  </h4>
                  <p className="text-base text-stone-500 mb-4 leading-relaxed font-medium">
                    {brief.weakness.description}
                  </p>
                  <div className="inline-flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      {brief.weakness.metric}:
                    </span>
                    <span className="text-base font-black text-rose-600 tracking-tighter">
                      {brief.weakness.value}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experiment Section */}
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#1a1f2e] uppercase tracking-[0.25em]">
                      The Experiment
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-[#1a1f2e] tracking-tight mb-2">
                    {brief.experiment.title}
                  </h4>
                  <p className="text-base text-stone-500 mb-6 leading-relaxed font-medium">
                    {brief.experiment.description}
                  </p>
                  <div className="bg-stone-50 rounded-2xl p-8 relative group border border-stone-100">
                    <p className="text-[10px] text-stone-400 mb-4 font-bold uppercase tracking-[0.25em]">The format:</p>
                    <p className="text-2xl text-slate-900 serif-heading leading-tight italic">
                      &ldquo;{brief.experiment.templateCast}&rdquo;
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-200"></span>
                    <span>Rationale: {brief.experiment.rationale}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="bg-white px-8 py-6 border-t border-stone-50 flex justify-between items-center">
            <p className="text-[10px] text-stone-300 font-bold uppercase tracking-[0.4em]">
              TUNE INTELLIGENCE REPORT
            </p>
            <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">
              REV {new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }).replace('/', '-')}
            </p>
          </div>
        </Card>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}