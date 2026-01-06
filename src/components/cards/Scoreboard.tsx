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

function InfoButton({ info, label }: { info: string; label: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={() => setShow(!show)}
        aria-label={`More info about ${label}`}
        aria-expanded={show}
        className="ml-1.5 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center"
      >
        ?
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShow(false)} />
          <div className="absolute z-20 bottom-7 left-1/2 -translate-x-1/2 w-52 p-3 bg-zinc-800 text-white text-xs rounded-lg shadow-lg">
            {info}
          </div>
        </>
      )}
    </span>
  );
}

const GENERIC_LABELS = ['All Posts', 'Mixed Topics'];

export function Scoreboard({ metrics, topTheme }: ScoreboardProps) {
  const showTopTheme = topTheme && !GENERIC_LABELS.includes(topTheme.label);
  const filteredThemes = metrics.topThemes.filter(
    (theme) => theme !== topTheme?.label && !GENERIC_LABELS.includes(theme)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {(metrics.replyRate * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Reply Rate<InfoButton info={metricInfo.replies} label="reply rate" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {(metrics.repeatReplierRate * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Repeat Fans<InfoButton info={metricInfo.repeat} label="repeat fans" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.medianEngagementScore.toFixed(1)}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Engagement<InfoButton info={metricInfo.engage} label="engagement" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.totalCasts}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Posts<InfoButton info={metricInfo.posts} label="posts" />
            </div>
          </div>
        </div>

        {(showTopTheme || filteredThemes.length > 0) && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs">
            {showTopTheme && <Badge variant="success">{topTheme.label}</Badge>}
            {filteredThemes.slice(0, 2).map((theme, idx) => (
              <Badge key={idx} variant="default">{theme}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
