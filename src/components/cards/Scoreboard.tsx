'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import type { UserMetrics, ThemeCluster } from '@/types';

interface ScoreboardProps {
  metrics: UserMetrics;
  topTheme: ThemeCluster | null;
}

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <button
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-3.5 h-3.5 rounded-full bg-stone-100 text-stone-400 text-[9px] font-bold flex items-center justify-center"
      >
        ?
      </button>
      {show && (
        <div className="absolute z-50 bottom-full right-0 mb-2 w-48 p-2 bg-[#1a1f2e] text-white text-[10px] rounded-lg shadow-xl">
          <p className="leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}

const GENERIC_LABELS = ['All Posts', 'Mixed Topics'];

export function Scoreboard({ metrics, topTheme }: ScoreboardProps) {
  // Filter out generic labels
  const showTopTheme = topTheme && !GENERIC_LABELS.includes(topTheme.label);
  return (
    <Card className="border-none shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] bg-white">
      <CardHeader className="py-3 px-5">
        <CardTitle className="text-base serif-heading italic">Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Reply Rate */}
          <div className="flex flex-col">
            <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider flex items-center mb-1">
              Reply rate <InfoTip text="% of posts with ≥1 reply" />
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1a1f2e] tracking-tighter">
                {(metrics.replyRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Avg Score */}
          <div className="flex flex-col">
            <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider flex items-center mb-1">
              Avg Score <InfoTip text="Median engagement per post" />
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1a1f2e] tracking-tighter">
                {metrics.medianEngagementScore.toFixed(0)}
              </span>
              <span className="text-[9px] text-stone-400 font-bold uppercase">pts</span>
            </div>
          </div>

          {/* Return Rate */}
          <div className="flex flex-col">
            <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider flex items-center mb-1">
              Loyalty <InfoTip text="% of repliers who return" />
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1a1f2e] tracking-tighter">
                {(metrics.repeatReplierRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Reciprocity */}
          {metrics.reciprocityRate !== null && (
            <div className="flex flex-col">
              <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider flex items-center mb-1">
                Reciprocity <InfoTip text="% who reply back to you" />
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#1a1f2e] tracking-tighter">
                  {(metrics.reciprocityRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top Topic Compact */}
        {showTopTheme && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                Best Topic
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#1a1f2e]">
                  {topTheme.label}
                </span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {topTheme.avgEngagement.toFixed(0)} avg
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
