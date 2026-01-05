'use client';

import { Card, CardHeader, CardContent, CardTitle, Stat, StatGrid, Badge } from '@/components/ui';
import type { UserMetrics, ThemeCluster } from '@/types';

interface ScoreboardProps {
  metrics: UserMetrics;
  topTheme: ThemeCluster | null;
}

export function Scoreboard({ metrics, topTheme }: ScoreboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <StatGrid>
          <Stat
            label="Reply Rate"
            value={`${(metrics.replyRate * 100).toFixed(0)}%`}
            subValue="of posts got replies"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            }
          />
          <Stat
            label="Repeat Repliers"
            value={`${(metrics.repeatReplierRate * 100).toFixed(0)}%`}
            subValue="came back again"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <Stat
            label="Median Engagement"
            value={metrics.medianEngagementScore.toFixed(1)}
            subValue="score per post"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <Stat
            label="Total Posts"
            value={metrics.totalCasts}
            subValue="in last 30 days"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </StatGrid>

        {topTheme && (
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Top Performing Theme</span>
              <div className="flex items-center gap-2">
                <Badge variant="success">{topTheme.label}</Badge>
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  {topTheme.avgEngagement.toFixed(1)} avg engagement
                </span>
              </div>
            </div>
          </div>
        )}

        {metrics.topThemes.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Your Topics</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {metrics.topThemes.map((theme, idx) => (
                <Badge key={idx} variant="default">{theme}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
