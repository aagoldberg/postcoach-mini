'use client';

import { useRef, useCallback } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import type { WeeklyBrief as WeeklyBriefType } from '@/types';

interface WeeklyBriefProps {
  brief: WeeklyBriefType;
  username: string;
  onShareImage?: () => void;
}

export function WeeklyBrief({ brief, username, onShareImage }: WeeklyBriefProps) {
  const briefRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = useCallback(() => {
    const text = `My Tenor Weekly Brief

WIN: ${brief.win.title}
${brief.win.description}
${brief.win.metric}: ${brief.win.value}

WEAKNESS: ${brief.weakness.title}
${brief.weakness.description}
${brief.weakness.metric}: ${brief.weakness.value}

EXPERIMENT: ${brief.experiment.title}
${brief.experiment.description}

Try this: "${brief.experiment.templateCast}"

Generated with Tenor`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Brief copied to clipboard!');
    });
  }, [brief]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Weekly Brief
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your action items for this week
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            Copy
          </Button>
          {onShareImage && (
            <Button variant="primary" size="sm" onClick={onShareImage}>
              Share
            </Button>
          )}
        </div>
      </div>

      <div ref={briefRef} id="weekly-brief-card">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-violet-200 text-sm">@{username}</span>
              <span className="text-violet-200 text-sm">
                {new Date(brief.periodStart).toLocaleDateString()} - {new Date(brief.periodEnd).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">Weekly Brief</h3>
            <p className="text-violet-200 text-sm">Your path to Farcaster influence</p>
          </div>

          <CardContent className="p-0">
            {/* Win Section */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                      Win
                    </span>
                  </div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {brief.win.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    {brief.win.description}
                  </p>
                  <div className="inline-flex flex-wrap items-center gap-1 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-green-600 dark:text-green-400">{brief.win.metric}:</span>
                    <span className="font-semibold text-green-700 dark:text-green-300">{brief.win.value}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weakness Section */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Weakness
                    </span>
                  </div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {brief.weakness.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    {brief.weakness.description}
                  </p>
                  <div className="inline-flex flex-wrap items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-amber-600 dark:text-amber-400">{brief.weakness.metric}:</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-300">{brief.weakness.value}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experiment Section */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                      Experiment
                    </span>
                  </div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {brief.experiment.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {brief.experiment.description}
                  </p>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Try posting:</p>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 italic">
                      &ldquo;{brief.experiment.templateCast}&rdquo;
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                    {brief.experiment.rationale}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-3 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Generated by Tenor • {new Date(brief.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
