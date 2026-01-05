import type {
  Cast,
  CastMetrics,
  CastContentFeatures,
  CastFeedback,
  WeeklyBrief,
  BriefInsight,
  BriefExperiment,
  ThemeCluster,
  UserMetrics,
} from '@/types';
import { callClaude, batchCallClaude } from './client';
import {
  CAST_FEEDBACK_SYSTEM,
  getCastFeedbackPrompt,
  WEEKLY_BRIEF_SYSTEM,
  getWeeklyBriefPrompt,
  CLUSTER_LABEL_SYSTEM,
  getClusterLabelPrompt,
  type CastFeedbackInput,
  type WeeklyBriefInput,
} from './prompts';

/**
 * Parse JSON from Claude response, handling markdown code blocks
 */
function parseJSON<T>(text: string): T {
  // Remove markdown code blocks if present
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }

  return JSON.parse(cleanText.trim());
}

/**
 * Generate feedback for a single cast
 */
export async function generateCastFeedback(
  cast: Cast,
  metrics: CastMetrics,
  contentFeatures: CastContentFeatures,
  theme: string | null,
  isTopPerformer: boolean,
  medianEngagement: number
): Promise<CastFeedback | null> {
  const input: CastFeedbackInput = {
    text: cast.text,
    engagementScore: metrics.engagementScore,
    likesCount: metrics.likesCount,
    recastsCount: metrics.recastsCount,
    repliesCount: metrics.repliesCount,
    velocityScore: metrics.velocityScore,
    hasQuestion: contentFeatures.hasQuestion,
    hasCTA: contentFeatures.hasCTA,
    ctaWords: contentFeatures.ctaWords,
    sentiment: contentFeatures.sentiment,
    wordCount: contentFeatures.wordCount,
    hasMedia: contentFeatures.hasMedia,
    theme,
    isTopPerformer,
    medianEngagement: medianEngagement || 1, // Avoid division by zero
  };

  const result = await callClaude(
    CAST_FEEDBACK_SYSTEM,
    getCastFeedbackPrompt(input),
    (text) => parseJSON<Omit<CastFeedback, 'castHash'>>(text)
  );

  if (!result.success || !result.data) {
    console.error('Failed to generate cast feedback:', result.error);
    return null;
  }

  return {
    castHash: cast.hash,
    ...result.data,
  };
}

/**
 * Generate feedback for multiple casts in batch
 */
export async function generateBatchCastFeedback(
  casts: Cast[],
  metricsMap: Map<string, CastMetrics>,
  contentMap: Map<string, CastContentFeatures>,
  castToTheme: Map<string, string | null>,
  topHashes: Set<string>,
  medianEngagement: number
): Promise<Map<string, CastFeedback>> {
  const results = new Map<string, CastFeedback>();

  const items = casts.map((cast) => {
    const metrics = metricsMap.get(cast.hash)!;
    const content = contentMap.get(cast.hash)!;
    const theme = castToTheme.get(cast.hash) || null;
    const isTopPerformer = topHashes.has(cast.hash);

    const input: CastFeedbackInput = {
      text: cast.text,
      engagementScore: metrics.engagementScore,
      likesCount: metrics.likesCount,
      recastsCount: metrics.recastsCount,
      repliesCount: metrics.repliesCount,
      velocityScore: metrics.velocityScore,
      hasQuestion: content.hasQuestion,
      hasCTA: content.hasCTA,
      ctaWords: content.ctaWords,
      sentiment: content.sentiment,
      wordCount: content.wordCount,
      hasMedia: content.hasMedia,
      theme,
      isTopPerformer,
      medianEngagement: medianEngagement || 1,
    };

    return {
      id: cast.hash,
      prompt: getCastFeedbackPrompt(input),
    };
  });

  const batchResults = await batchCallClaude(
    CAST_FEEDBACK_SYSTEM,
    items,
    (text, id) => ({
      castHash: id,
      ...parseJSON<Omit<CastFeedback, 'castHash'>>(text),
    })
  );

  for (const [hash, result] of batchResults) {
    if (result.success && result.data) {
      results.set(hash, result.data);
    }
  }

  return results;
}

/**
 * Generate weekly brief
 */
export async function generateWeeklyBrief(
  fid: number,
  username: string,
  userMetrics: UserMetrics,
  themes: ThemeCluster[],
  topCasts: Cast[],
  bottomCasts: Cast[],
  featureCorrelation: {
    questionImpact: number;
    ctaImpact: number;
    avgWordCountTop: number;
    avgWordCountBottom: number;
  }
): Promise<WeeklyBrief | null> {
  // Get top theme
  const sortedThemes = [...themes].sort((a, b) => b.avgEngagement - a.avgEngagement);
  const topTheme = sortedThemes[0];

  const input: WeeklyBriefInput = {
    username,
    totalCasts: userMetrics.totalCasts,
    medianEngagement: userMetrics.medianEngagementScore,
    replyRate: userMetrics.replyRate,
    repeatReplierRate: userMetrics.repeatReplierRate,
    reciprocityRate: userMetrics.reciprocityRate,
    topThemes: themes.map((t) => t.label).slice(0, 5),
    topPerformingTheme: topTheme?.label || null,
    topPerformingThemeEngagement: topTheme?.avgEngagement || null,
    questionImpact: featureCorrelation.questionImpact,
    ctaImpact: featureCorrelation.ctaImpact,
    avgWordCountTop: featureCorrelation.avgWordCountTop,
    avgWordCountBottom: featureCorrelation.avgWordCountBottom,
    topCastSamples: topCasts.map((c) => c.text),
    bottomCastSamples: bottomCasts.map((c) => c.text),
  };

  const result = await callClaude(
    WEEKLY_BRIEF_SYSTEM,
    getWeeklyBriefPrompt(input),
    (text) =>
      parseJSON<{ win: BriefInsight; weakness: BriefInsight; experiment: BriefExperiment }>(text)
  );

  if (!result.success || !result.data) {
    console.error('Failed to generate weekly brief:', result.error);
    // Return a default brief
    return {
      fid,
      generatedAt: new Date(),
      periodStart: userMetrics.periodStart,
      periodEnd: userMetrics.periodEnd,
      win: {
        title: 'Keep Posting',
        description: `You posted ${userMetrics.totalCasts} times this period.`,
        metric: 'Total Posts',
        value: userMetrics.totalCasts.toString(),
      },
      weakness: {
        title: 'Engagement Opportunity',
        description: 'Focus on posts that spark conversations.',
        metric: 'Reply Rate',
        value: `${(userMetrics.replyRate * 100).toFixed(0)}%`,
      },
      experiment: {
        title: 'Ask Questions',
        description: 'Try ending your next few posts with genuine questions.',
        templateCast: "What's something you learned this week that changed how you think?",
        rationale: 'Questions invite responses and boost reply rates.',
      },
    };
  }

  return {
    fid,
    generatedAt: new Date(),
    periodStart: userMetrics.periodStart,
    periodEnd: userMetrics.periodEnd,
    ...result.data,
  };
}

/**
 * Generate labels for theme clusters
 */
export async function labelClusters(
  clusters: ThemeCluster[]
): Promise<ThemeCluster[]> {
  const labeledClusters: ThemeCluster[] = [];

  for (const cluster of clusters) {
    // Skip if already has a good label
    if (cluster.label && !cluster.label.startsWith('Topic ')) {
      labeledClusters.push(cluster);
      continue;
    }

    // Extract keywords from label if it exists
    const keywords = cluster.label.includes(',')
      ? cluster.label.split(',').map((k) => k.trim())
      : [];

    const result = await callClaude(
      CLUSTER_LABEL_SYSTEM,
      getClusterLabelPrompt(cluster.sampleTexts, keywords),
      (text) => text.trim()
    );

    labeledClusters.push({
      ...cluster,
      label: result.success && result.data ? result.data : cluster.label,
    });
  }

  return labeledClusters;
}
