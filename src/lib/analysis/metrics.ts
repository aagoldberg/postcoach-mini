import type {
  Cast,
  CastEngagement,
  CastMetrics,
  UserMetrics,
  EngagementWeights,
} from '@/types';
import { DEFAULT_ENGAGEMENT_WEIGHTS } from '@/types';

const DEFAULT_VELOCITY_WINDOW_HOURS = 6;

/**
 * Calculate engagement score for a cast
 * Formula: replies*3 + likes*1 + recasts*2 (weights are configurable)
 */
export function calculateEngagementScore(
  engagement: CastEngagement,
  weights: EngagementWeights = DEFAULT_ENGAGEMENT_WEIGHTS
): number {
  return (
    engagement.repliesCount * weights.reply +
    engagement.likesCount * weights.like +
    engagement.recastsCount * weights.recast
  );
}

/**
 * Calculate velocity score - what fraction of replies came in the first X hours
 * Higher velocity = content that sparked immediate engagement
 */
export function calculateVelocityScore(
  cast: Cast,
  engagement: CastEngagement,
  windowHours: number = DEFAULT_VELOCITY_WINDOW_HOURS
): number | null {
  if (engagement.repliesCount === 0 || engagement.replies.length === 0) {
    return null;
  }

  const windowEnd = new Date(cast.timestamp.getTime() + windowHours * 60 * 60 * 1000);
  const earlyReplies = engagement.replies.filter((r) => r.timestamp <= windowEnd);

  return earlyReplies.length / engagement.repliesCount;
}

/**
 * Calculate conversation depth - proxy by average reply chain depth
 * For MVP, we use total replies as a proxy since getting full thread depth is expensive
 */
export function calculateConversationDepth(engagement: CastEngagement): number {
  // Simple proxy: log scale of replies to dampen outliers
  if (engagement.repliesCount === 0) return 0;
  return Math.log2(engagement.repliesCount + 1);
}

/**
 * Compute all metrics for a single cast
 */
export function computeCastMetrics(
  cast: Cast,
  engagement: CastEngagement,
  weights: EngagementWeights = DEFAULT_ENGAGEMENT_WEIGHTS,
  velocityWindowHours: number = DEFAULT_VELOCITY_WINDOW_HOURS
): CastMetrics {
  return {
    castHash: cast.hash,
    engagementScore: calculateEngagementScore(engagement, weights),
    velocityScore: calculateVelocityScore(cast, engagement, velocityWindowHours),
    conversationDepth: calculateConversationDepth(engagement),
    uniqueRepliersCount: engagement.uniqueRepliers.length,
    likesCount: engagement.likesCount,
    recastsCount: engagement.recastsCount,
    repliesCount: engagement.repliesCount,
  };
}

/**
 * Calculate median of an array of numbers
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Compute user-level aggregate metrics
 */
export function computeUserMetrics(
  fid: number,
  casts: Cast[],
  metricsMap: Map<string, CastMetrics>,
  engagementMap: Map<string, CastEngagement>,
  userRepliedToFids?: Set<number>
): UserMetrics {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter to analysis period
  const recentCasts = casts.filter((c) => c.timestamp >= thirtyDaysAgo);

  // Calculate engagement scores
  const engagementScores = recentCasts
    .map((c) => metricsMap.get(c.hash)?.engagementScore ?? 0);

  // Calculate replies counts
  const repliesCounts = recentCasts
    .map((c) => metricsMap.get(c.hash)?.repliesCount ?? 0);

  // Reply rate: fraction of casts that got at least one reply
  const castsWithReply = recentCasts.filter(
    (c) => (metricsMap.get(c.hash)?.repliesCount ?? 0) > 0
  );
  const replyRate = recentCasts.length > 0 ? castsWithReply.length / recentCasts.length : 0;

  // Repeat replier rate: fraction of repliers who replied 2+ times across all casts
  const replierCounts = new Map<number, number>();
  for (const cast of recentCasts) {
    const engagement = engagementMap.get(cast.hash);
    if (engagement) {
      for (const replierFid of engagement.uniqueRepliers) {
        replierCounts.set(replierFid, (replierCounts.get(replierFid) || 0) + 1);
      }
    }
  }

  const totalRepliers = replierCounts.size;
  const repeatRepliers = [...replierCounts.values()].filter((count) => count >= 2).length;
  const repeatReplierRate = totalRepliers > 0 ? repeatRepliers / totalRepliers : 0;

  // Reciprocity rate: what fraction of people we replied to also replied back to us
  let reciprocityRate: number | null = null;
  if (userRepliedToFids && userRepliedToFids.size > 0) {
    const allRepliersToUs = new Set<number>();
    for (const cast of recentCasts) {
      const engagement = engagementMap.get(cast.hash);
      if (engagement) {
        for (const fid of engagement.uniqueRepliers) {
          allRepliersToUs.add(fid);
        }
      }
    }

    let reciprocated = 0;
    for (const fid of userRepliedToFids) {
      if (allRepliersToUs.has(fid)) {
        reciprocated++;
      }
    }

    reciprocityRate = userRepliedToFids.size > 0 ? reciprocated / userRepliedToFids.size : 0;
  }

  // Get date range
  const timestamps = recentCasts.map((c) => c.timestamp.getTime());
  const periodStart = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : thirtyDaysAgo;
  const periodEnd = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : now;

  return {
    fid,
    periodStart,
    periodEnd,
    totalCasts: recentCasts.length,
    medianEngagementScore: median(engagementScores),
    medianRepliesCount: median(repliesCounts),
    replyRate,
    repeatReplierRate,
    reciprocityRate,
    topThemes: [], // Populated by clustering module
  };
}

/**
 * Get top N casts by engagement score
 */
export function getTopCasts(
  casts: Cast[],
  metricsMap: Map<string, CastMetrics>,
  n: number = 5
): Cast[] {
  return [...casts]
    .sort((a, b) => {
      const scoreA = metricsMap.get(a.hash)?.engagementScore ?? 0;
      const scoreB = metricsMap.get(b.hash)?.engagementScore ?? 0;
      return scoreB - scoreA;
    })
    .slice(0, n);
}

/**
 * Get bottom N casts by engagement score
 * Excludes casts with very low sample (engagement = 0 and < 1 hour old)
 */
export function getBottomCasts(
  casts: Cast[],
  metricsMap: Map<string, CastMetrics>,
  n: number = 5
): Cast[] {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Filter out very new casts with no engagement (not enough time to judge)
  const eligibleCasts = casts.filter((c) => {
    const metrics = metricsMap.get(c.hash);
    if (!metrics) return false;

    // Keep if it has any engagement, or if it's older than an hour
    return metrics.engagementScore > 0 || c.timestamp < oneHourAgo;
  });

  return [...eligibleCasts]
    .sort((a, b) => {
      const scoreA = metricsMap.get(a.hash)?.engagementScore ?? 0;
      const scoreB = metricsMap.get(b.hash)?.engagementScore ?? 0;
      return scoreA - scoreB;
    })
    .slice(0, n);
}

/**
 * Categorize casts into performance buckets based on percentile
 */
export function categorizeCastPerformance(
  castHash: string,
  metricsMap: Map<string, CastMetrics>,
  topThreshold: number = 0.2, // Top 20%
  bottomThreshold: number = 0.2 // Bottom 20%
): 'top' | 'bottom' | 'middle' {
  const allScores = [...metricsMap.values()]
    .map((m) => m.engagementScore)
    .sort((a, b) => a - b);

  const score = metricsMap.get(castHash)?.engagementScore ?? 0;

  if (allScores.length === 0) return 'middle';

  const rank = allScores.filter((s) => s < score).length;
  const percentile = rank / allScores.length;

  if (percentile >= 1 - topThreshold) return 'top';
  if (percentile <= bottomThreshold) return 'bottom';
  return 'middle';
}
