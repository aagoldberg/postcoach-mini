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
    <div className="space-y-8 animate-in fade-in duration-1000 pb-12">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between py-4 border-b border-stone-200/60 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          ← New Analysis
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">
            {result.cached ? 'Cached' : 'Fresh'} • #{user.fid}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (User & Scoreboard) */}
        <div className="lg:col-span-4 space-y-6">
          <UserHeader user={user} />
          <Scoreboard metrics={userMetrics} topTheme={topTheme} />
        </div>

        {/* Right Column (Weekly Brief & Deep Dives) */}
        <div className="lg:col-span-8 space-y-12">
           <WeeklyBrief
            brief={weeklyBrief}
            username={user.username}
            onShareImage={handleShareImage}
          />

          {/* Deep Dives */}
          <div className="space-y-12">
            <section>
              {topCasts.length > 0 ? (
                <FeedbackSection
                  title="Success Vectors"
                  description="High-engagement patterns identified in recent activity"
                  analyses={topCasts}
                  type="top"
                />
              ) : (
                <EmptyState
                  title="No Top Posts Yet"
                  description="We need a bit more history to identify your best performing content. Keep casting!"
                />
              )}
            </section>

            {bottomCasts.length > 0 && (
              <FeedbackSection
                title="Friction Points"
                description="Content that underperformed relative to audience baseline"
                analyses={bottomCasts}
                type="bottom"
              />
            )}
          </div>
        </div>
      </div>
      
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}