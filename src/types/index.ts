// Core Types for PostCoach - Farcaster Influence Coach

// ============= Farcaster Data Types =============

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
}

export interface Cast {
  hash: string;
  fid: number;
  text: string;
  timestamp: Date;
  parentHash: string | null;
  parentUrl: string | null;
  embeds: CastEmbed[];
  mentions: number[];
  mentionsPositions: number[];
}

export interface CastEmbed {
  url?: string;
  castId?: { fid: number; hash: string };
}

export interface Reaction {
  fid: number;
  timestamp: Date;
  type: 'like' | 'recast';
}

export interface Reply {
  hash: string;
  fid: number;
  text: string;
  timestamp: Date;
  parentHash: string;
}

// ============= Engagement & Metrics Types =============

export interface CastEngagement {
  castHash: string;
  likesCount: number;
  recastsCount: number;
  repliesCount: number;
  uniqueRepliers: number[];
  reactions: Reaction[];
  replies: Reply[];
}

export interface CastMetrics {
  castHash: string;
  engagementScore: number; // replies*3 + likes*1 + recasts*2
  velocityScore: number | null; // replies in first X hours / total replies
  conversationDepth: number; // avg reply chain depth or proxy
  uniqueRepliersCount: number;
  likesCount: number;
  recastsCount: number;
  repliesCount: number;
}

export interface UserMetrics {
  fid: number;
  periodStart: Date;
  periodEnd: Date;
  totalCasts: number;
  medianEngagementScore: number;
  medianRepliesCount: number;
  replyRate: number; // casts_with_reply / total_casts
  repeatReplierRate: number; // fraction of repliers who replied ≥2 times
  reciprocityRate: number | null; // fraction of accounts user replied to who also replied back
  topThemes: string[];
}

// ============= Content Analysis Types =============

export interface CastContentFeatures {
  castHash: string;
  hasQuestion: boolean;
  hasCTA: boolean;
  ctaWords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  wordCount: number;
  hasMedia: boolean;
  hasMentions: boolean;
  hasLinks: boolean;
}

export interface ThemeCluster {
  id: number;
  label: string;
  description: string;
  castHashes: string[];
  avgEngagement: number;
  sampleTexts: string[];
}

// ============= Analysis Results Types =============

export interface CastAnalysis {
  cast: Cast;
  metrics: CastMetrics;
  content: CastContentFeatures;
  theme: string | null;
  rank: 'top' | 'bottom' | 'middle';
  feedback: CastFeedback | null;
}

export interface CastFeedback {
  castHash: string;
  likelyCauses: string[];
  whatToReplicate: string[];
  whatToAvoid: string[];
  summary: string;
}

export interface WeeklyBrief {
  fid: number;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  win: BriefInsight;
  weakness: BriefInsight;
  experiment: BriefExperiment;
}

export interface BriefInsight {
  title: string;
  description: string;
  metric: string;
  value: string;
}

export interface BriefExperiment {
  title: string;
  description: string;
  templateCast: string;
  rationale: string;
}

// ============= Full Analysis Result =============

export interface AnalysisResult {
  user: FarcasterUser;
  userMetrics: UserMetrics;
  themes: ThemeCluster[];
  topCasts: CastAnalysis[];
  bottomCasts: CastAnalysis[];
  allCasts: CastAnalysis[];
  weeklyBrief: WeeklyBrief;
  generatedAt: Date;
  cached: boolean;
}

// ============= API Response Types =============

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  cached?: boolean;
}

export interface BriefResponse {
  success: boolean;
  data?: WeeklyBrief;
  error?: string;
}

// ============= Database Schema Types =============

export interface CachedAnalysis {
  id: string;
  fid: number;
  analysisJson: string;
  createdAt: Date;
  expiresAt: Date;
}

// ============= Config Types =============

export interface EngagementWeights {
  reply: number;
  like: number;
  recast: number;
}

export const DEFAULT_ENGAGEMENT_WEIGHTS: EngagementWeights = {
  reply: 3,
  like: 1,
  recast: 2,
};

export interface AnalysisConfig {
  maxCasts: number;
  daysBack: number;
  velocityWindowHours: number;
  topN: number;
  bottomN: number;
  clusterCount: number;
  engagementWeights: EngagementWeights;
}

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  maxCasts: 100,
  daysBack: 30,
  velocityWindowHours: 6,
  topN: 5,
  bottomN: 5,
  clusterCount: 7,
  engagementWeights: DEFAULT_ENGAGEMENT_WEIGHTS,
};
