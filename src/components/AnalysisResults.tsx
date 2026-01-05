'use client';

import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { AnalysisResult } from '@/types';
import { UserHeader, Scoreboard, FeedbackSection } from '@/components/cards';
import { WeeklyBrief } from '@/components/brief';
import { Button } from '@/components/ui';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { user, userMetrics, themes, topCasts, bottomCasts, weeklyBrief } = result;

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
        backgroundColor: '#ffffff',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `postcoach-brief-${user.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate image. Please try again.');
    }
  }, [user.username]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onReset}>
          ← Analyze Another
        </Button>
        {result.cached && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Cached result • Generated {new Date(result.generatedAt).toLocaleString()}
          </span>
        )}
      </div>

      {/* User Header */}
      <UserHeader user={user} />

      {/* Scoreboard */}
      <Scoreboard metrics={userMetrics} topTheme={topTheme} />

      {/* Top Posts */}
      {topCasts.length > 0 && (
        <FeedbackSection
          title="Top Performers"
          description="Your posts that sparked the most engagement"
          analyses={topCasts}
          type="top"
        />
      )}

      {/* Bottom Posts */}
      {bottomCasts.length > 0 && (
        <FeedbackSection
          title="Underperformers"
          description="Posts that didn't hit their potential - here's why"
          analyses={bottomCasts}
          type="bottom"
        />
      )}

      {/* Weekly Brief */}
      <WeeklyBrief
        brief={weeklyBrief}
        username={user.username}
        onShareImage={handleShareImage}
      />
    </div>
  );
}
