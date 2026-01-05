import type {
  AnalysisResult,
  CastAnalysis,
  FarcasterUser,
  AnalysisConfig,
} from '@/types';
import { DEFAULT_ANALYSIS_CONFIG } from '@/types';
import { getFarcasterProvider } from '@/lib/farcaster';
import {
  computeCastMetrics,
  computeUserMetrics,
  getTopCasts,
  getBottomCasts,
  categorizeCastPerformance,
} from './metrics';
import { extractBatchContentFeatures, analyzeFeatureCorrelation } from './content';
import { clusterCasts, getTopTheme } from './clustering';
import {
  generateBatchCastFeedback,
  generateWeeklyBrief,
  labelClusters,
} from '@/lib/llm';

export interface AnalysisPipelineOptions {
  config?: Partial<AnalysisConfig>;
  onProgress?: (stage: string, progress: number) => void;
}

/**
 * Main analysis pipeline - orchestrates all modules
 */
export async function runAnalysisPipeline(
  fidOrUsername: number | string,
  options: AnalysisPipelineOptions = {}
): Promise<AnalysisResult> {
  const config = { ...DEFAULT_ANALYSIS_CONFIG, ...options.config };
  const onProgress = options.onProgress || (() => {});

  const provider = getFarcasterProvider();

  // Stage 1: Fetch user data
  onProgress('Fetching user profile...', 10);

  let user: FarcasterUser | null;
  if (typeof fidOrUsername === 'number') {
    user = await provider.getUserByFid(fidOrUsername);
  } else {
    user = await provider.getUserByUsername(fidOrUsername);
  }

  if (!user) {
    throw new Error(`User not found: ${fidOrUsername}`);
  }

  // Stage 2: Fetch casts
  onProgress('Fetching recent casts...', 20);

  const casts = await provider.getCastsByFid(user.fid, config.maxCasts);

  if (casts.length === 0) {
    throw new Error('No casts found for this user');
  }

  // Filter to last N days
  const cutoffDate = new Date(Date.now() - config.daysBack * 24 * 60 * 60 * 1000);
  const recentCasts = casts.filter((c) => c.timestamp >= cutoffDate);

  if (recentCasts.length === 0) {
    throw new Error(`No casts found in the last ${config.daysBack} days`);
  }

  // Stage 3: Fetch engagement data
  onProgress('Computing engagement metrics...', 35);

  const engagementMap = await provider.getBatchEngagement(
    recentCasts.map((c) => c.hash)
  );

  // Compute cast-level metrics
  const metricsMap = new Map(
    recentCasts.map((cast) => {
      const engagement = engagementMap.get(cast.hash);
      if (!engagement) {
        return [cast.hash, {
          castHash: cast.hash,
          engagementScore: 0,
          velocityScore: null,
          conversationDepth: 0,
          uniqueRepliersCount: 0,
          likesCount: 0,
          recastsCount: 0,
          repliesCount: 0,
        }];
      }
      return [cast.hash, computeCastMetrics(cast, engagement, config.engagementWeights)];
    })
  );

  // Stage 4: Extract content features
  onProgress('Analyzing content features...', 50);

  const contentMap = extractBatchContentFeatures(recentCasts);

  // Stage 5: Cluster by topic
  onProgress('Identifying themes...', 60);

  const { clusters, castToCluster } = clusterCasts(
    recentCasts,
    metricsMap,
    config.clusterCount
  );

  // Label clusters with LLM
  const labeledClusters = await labelClusters(clusters);

  // Create mapping from cast to theme label
  const castToTheme = new Map<string, string | null>();
  for (const [hash, clusterId] of castToCluster) {
    const cluster = labeledClusters.find((c) => c.id === clusterId);
    castToTheme.set(hash, cluster?.label || null);
  }

  // Stage 6: Calculate user metrics
  onProgress('Computing user metrics...', 70);

  // Get FIDs the user has replied to for reciprocity calculation
  const userReplies = await provider.getUserReplies(user.fid, 100);
  const repliedToFids = new Set<number>();
  for (const reply of userReplies) {
    // The parent cast's author would be who they replied to
    // For simplicity, we're tracking FIDs from replies - this is a proxy
    if (reply.mentions.length > 0) {
      reply.mentions.forEach((fid) => repliedToFids.add(fid));
    }
  }

  const userMetrics = computeUserMetrics(
    user.fid,
    recentCasts,
    metricsMap,
    engagementMap,
    repliedToFids
  );

  // Add top themes to user metrics
  userMetrics.topThemes = labeledClusters
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 3)
    .map((c) => c.label);

  // Stage 7: Get top and bottom performers
  onProgress('Identifying top and bottom posts...', 80);

  const topCasts = getTopCasts(recentCasts, metricsMap, config.topN);
  const bottomCasts = getBottomCasts(recentCasts, metricsMap, config.bottomN);

  const topHashes = new Set(topCasts.map((c) => c.hash));
  const bottomHashes = new Set(bottomCasts.map((c) => c.hash));
  const feedbackCasts = [...topCasts, ...bottomCasts];

  // Stage 8: Generate feedback
  onProgress('Generating personalized feedback...', 85);

  const feedbackMap = await generateBatchCastFeedback(
    feedbackCasts,
    metricsMap,
    contentMap,
    castToTheme,
    topHashes,
    userMetrics.medianEngagementScore
  );

  // Stage 9: Generate weekly brief
  onProgress('Creating weekly brief...', 95);

  // Calculate feature correlation
  const engagementScores = new Map(
    [...metricsMap].map(([hash, m]) => [hash, m.engagementScore])
  );
  const featureCorrelation = analyzeFeatureCorrelation(contentMap, engagementScores);

  const weeklyBrief = await generateWeeklyBrief(
    user.fid,
    user.username,
    userMetrics,
    labeledClusters,
    topCasts,
    bottomCasts,
    featureCorrelation
  );

  if (!weeklyBrief) {
    throw new Error('Failed to generate weekly brief');
  }

  // Stage 10: Assemble results
  onProgress('Finalizing analysis...', 100);

  // Build full cast analysis objects
  const buildCastAnalysis = (cast: typeof recentCasts[0]): CastAnalysis => ({
    cast,
    metrics: metricsMap.get(cast.hash)!,
    content: contentMap.get(cast.hash)!,
    theme: castToTheme.get(cast.hash) || null,
    rank: categorizeCastPerformance(cast.hash, metricsMap),
    feedback: feedbackMap.get(cast.hash) || null,
  });

  const topCastAnalyses = topCasts.map(buildCastAnalysis);
  const bottomCastAnalyses = bottomCasts.map(buildCastAnalysis);
  const allCastAnalyses = recentCasts.map(buildCastAnalysis);

  return {
    user,
    userMetrics,
    themes: labeledClusters,
    topCasts: topCastAnalyses,
    bottomCasts: bottomCastAnalyses,
    allCasts: allCastAnalyses,
    weeklyBrief,
    generatedAt: new Date(),
    cached: false,
  };
}
