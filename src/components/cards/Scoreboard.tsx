'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';
import type { UserMetrics, ThemeCluster } from '@/types';

interface ScoreboardProps {
  metrics: UserMetrics;
  topTheme: ThemeCluster | null;
}

const metricInfo = {
  replies: "% of your posts that got at least one reply. Higher means your content sparks conversation.",
  repeat: "% of repliers who've engaged with you multiple times. Higher means you're building real fans.",
  engage: "Median engagement score across posts. Measures overall interaction quality.",
  posts: "Total posts analyzed from the last 30 days.",
};

function InfoButton({ info }: { info: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        className="ml-1 w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-[9px] font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600"
      >
        ?
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShow(false)} />
          <div className="absolute z-20 bottom-6 left-1/2 -translate-x-1/2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded-lg shadow-lg">
            {info}
          </div>
        </>
      )}
    </span>
  );
}

export function Scoreboard({ metrics, topTheme }: ScoreboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {(metrics.replyRate * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Replies<InfoButton info={metricInfo.replies} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {(metrics.repeatReplierRate * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Repeat<InfoButton info={metricInfo.repeat} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.medianEngagementScore.toFixed(1)}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Engage<InfoButton info={metricInfo.engage} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.totalCasts}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Posts<InfoButton info={metricInfo.posts} />
            </div>
          </div>
        </div>

        {(topTheme || metrics.topThemes.length > 0) && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs">
            {topTheme && <Badge variant="success">{topTheme.label}</Badge>}
            {metrics.topThemes.slice(0, 2).map((theme, idx) => (
              <Badge key={idx} variant="default">{theme}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
