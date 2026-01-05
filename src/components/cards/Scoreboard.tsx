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
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {topTheme && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Best Topic
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{topTheme.label}</Badge>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {topTheme.avgEngagement.toFixed(1)} avg
                  </span>
                </div>
              </div>
            )}

            {metrics.topThemes.length > 0 && (
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Your Topics
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {metrics.topThemes.map((theme, idx) => (
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
