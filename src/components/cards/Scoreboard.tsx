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
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <StatGrid>
          <Stat
            label="Reply Rate"
            value={`${(metrics.replyRate * 100).toFixed(0)}%`}
            subValue="got replies"
          />
          <Stat
            label="Repeat Fans"
            value={`${(metrics.repeatReplierRate * 100).toFixed(0)}%`}
            subValue="came back"
          />
          <Stat
            label="Engagement"
            value={metrics.medianEngagementScore.toFixed(1)}
            subValue="median score"
          />
          <Stat
            label="Posts"
            value={metrics.totalCasts}
            subValue="last 30 days"
          />
        </StatGrid>

        {(topTheme || metrics.topThemes.length > 0) && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            {topTheme && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Best Topic</span>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{topTheme.label}</Badge>
                  <span className="text-xs text-zinc-400">{topTheme.avgEngagement.toFixed(1)}</span>
                </div>
              </div>
            )}

            {metrics.topThemes.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Topics</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {metrics.topThemes.slice(0, 3).map((theme, idx) => (
                    <Badge key={idx} variant="default">{theme}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
