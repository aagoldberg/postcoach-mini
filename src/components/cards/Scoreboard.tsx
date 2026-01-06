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
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
            {topTheme && (
              <>
                <span className="text-[10px] text-zinc-400">Best:</span>
                <Badge variant="success">{topTheme.label}</Badge>
              </>
            )}
            {metrics.topThemes.length > 0 && (
              <>
                <span className="text-[10px] text-zinc-400 ml-1">Topics:</span>
                {metrics.topThemes.slice(0, 2).map((theme, idx) => (
                  <Badge key={idx} variant="default">{theme}</Badge>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
