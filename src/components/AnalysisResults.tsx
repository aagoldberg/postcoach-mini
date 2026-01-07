'use client';

import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { AnalysisResult } from '@/types';
import { UserHeader, Scoreboard, FeedbackSection } from '@/components/cards';
import { WeeklyBrief } from '@/components/brief';
import { Button, EmptyState, Toast } from '@/components/ui';
import { useState } from 'react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { user, userMetrics, themes, topCasts, bottomCasts, weeklyBrief } = result;
  const [toast, setToast] = useState<string | null>(null);

  // Get top theme for scoreboard
  const topTheme = themes.length > 0
    ? themes.reduce((best, current) =>
        current.avgEngagement > best.avgEngagement ? current : best
      )
    : null;

  const handleShareImage = useCallback(async () => {
    const element = document.getElementById('weekly-brief-card');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#f2f5f3',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `tune-report-${user.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      setToast('Failed to generate image');
    }
  }, [user.username]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Navigation Bar Compact */}
      <div className="flex items-center justify-between py-2 border-b border-stone-100">
        <button
          onClick={onReset}
          className="text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 flex items-center gap-1"
        >
          ← New Analysis
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">
            {result.cached ? 'Cached' : 'Fresh'} • #{user.fid}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* User & Scoreboard */}
        <div className="space-y-4">
          <UserHeader user={user} />
          <Scoreboard metrics={userMetrics} topTheme={topTheme} />
        </div>

        {/* Weekly Brief */}
        <WeeklyBrief
          brief={weeklyBrief}
          username={user.username}
          onShareImage={handleShareImage}
        />

        {/* Deep Dives */}
        <div className="space-y-8 pt-2">
          <section>
            {topCasts.length > 0 ? (
              <FeedbackSection
                title="Success Vectors"
                description="High-engagement patterns identified"
                analyses={topCasts}
                type="top"
              />
            ) : (
              <EmptyState
                title="No Top Posts Yet"
                description="Keep casting to unlock insights!"
              />
            )}
          </section>

          {bottomCasts.length > 0 && (
            <FeedbackSection
              title="Friction Points"
              description="Content that underperformed baseline"
              analyses={bottomCasts}
              type="bottom"
            />
          )}
        </div>
      </div>
      
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
