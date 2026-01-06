'use client';

import { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import type { CastAnalysis } from '@/types';

interface FeedbackCardProps {
  analysis: CastAnalysis;
  type: 'top' | 'bottom';
  defaultExpanded?: boolean;
}

export function FeedbackCard({ analysis, type, defaultExpanded = false }: FeedbackCardProps) {
  const { cast, metrics, content, feedback, theme } = analysis;
  const isTop = type === 'top';
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Get 2-3 most relevant badges
  const relevantBadges = [
    content.hasQuestion && 'Question',
    content.hasCTA && 'CTA',
    theme,
  ].filter(Boolean).slice(0, 2);

  return (
    <Card className={`overflow-hidden ${isTop ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-amber-500'}`}>
      {/* Collapsed Header - Always visible, clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed line-clamp-2 flex-1">
            {cast.text}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold ${isTop ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {metrics.engagementScore} pts
            </span>
            <svg
              className={`w-5 h-5 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Mini badges in collapsed view */}
        {!isExpanded && relevantBadges.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {relevantBadges.map((badge, idx) => (
              <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                {badge}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800">
          {/* Metrics Row */}
          <div className="flex flex-wrap gap-3 pt-4 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-700 dark:text-zinc-300">{metrics.likesCount}</strong> likes
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-700 dark:text-zinc-300">{metrics.repliesCount}</strong> replies
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-700 dark:text-zinc-300">{metrics.recastsCount}</strong> recasts
            </span>
          </div>

          {/* Content Features */}
          <div className="flex flex-wrap gap-2">
            {content.hasQuestion && <Badge variant="info">Question</Badge>}
            {content.hasCTA && <Badge variant="info">CTA</Badge>}
            {content.hasMedia && <Badge variant="default">Media</Badge>}
            {theme && <Badge variant="default">{theme}</Badge>}
            <Badge variant={content.sentiment === 'positive' ? 'success' : content.sentiment === 'negative' ? 'error' : 'default'}>
              {content.sentiment}
            </Badge>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 space-y-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {feedback.summary}
              </p>

              {isTop ? (
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                    What to replicate:
                  </p>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                    {feedback.whatToReplicate.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                    What to avoid:
                  </p>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                    {feedback.whatToAvoid.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-500 mt-0.5">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.likelyCauses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Likely causes:
                  </p>
                  <ul className="text-xs text-zinc-500 dark:text-zinc-500 space-y-0.5">
                    {feedback.likelyCauses.map((cause, idx) => (
                      <li key={idx}>• {cause}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

interface FeedbackSectionProps {
  title: string;
  description: string;
  analyses: CastAnalysis[];
  type: 'top' | 'bottom';
}

export function FeedbackSection({ title, description, analyses, type }: FeedbackSectionProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <FeedbackCard key={analysis.cast.hash} analysis={analysis} type={type} />
        ))}
      </div>
    </section>
  );
}
