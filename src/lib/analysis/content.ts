import type { Cast, CastContentFeatures } from '@/types';

// CTA (Call to Action) words and phrases that encourage engagement
const CTA_PATTERNS = [
  'thoughts',
  'what do you think',
  'agree',
  'disagree',
  'lmk',
  'let me know',
  'your take',
  'weigh in',
  'curious',
  'wondering',
  'drop a',
  'share your',
  'tell me',
  'anyone else',
  'who else',
  'am i the only',
  'hot take',
  'unpopular opinion',
  'change my mind',
  'prove me wrong',
  'reply',
  'comment',
  'discuss',
];

// Simple sentiment word lists for basic analysis
const POSITIVE_WORDS = [
  'amazing', 'awesome', 'great', 'love', 'excited', 'happy', 'fantastic',
  'wonderful', 'excellent', 'brilliant', 'incredible', 'perfect', 'best',
  'beautiful', 'gorgeous', 'superb', 'outstanding', 'magnificent', 'delightful',
  'thrilled', 'grateful', 'blessed', 'pumped', 'stoked', 'hyped', 'bullish',
  'based', 'legendary', 'goated', 'fire', 'lit', 'sick', 'dope',
];

const NEGATIVE_WORDS = [
  'terrible', 'awful', 'horrible', 'hate', 'sad', 'angry', 'frustrated',
  'disappointed', 'worst', 'bad', 'ugly', 'disgusting', 'annoying', 'boring',
  'stupid', 'dumb', 'ridiculous', 'pathetic', 'useless', 'broken', 'failed',
  'bearish', 'rugpull', 'scam', 'trash', 'garbage', 'cringe', 'mid',
];

/**
 * Check if text contains a question
 */
export function hasQuestion(text: string): boolean {
  // Check for question mark
  if (text.includes('?')) return true;

  // Check for question words at start of sentences
  const questionStarters = /\b(who|what|when|where|why|how|which|whose|whom|is|are|do|does|did|can|could|would|will|should)\b/i;
  return questionStarters.test(text);
}

/**
 * Detect CTA words/phrases in text
 */
export function detectCTAs(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundCTAs: string[] = [];

  for (const cta of CTA_PATTERNS) {
    if (lowerText.includes(cta)) {
      foundCTAs.push(cta);
    }
  }

  return foundCTAs;
}

/**
 * Simple sentiment analysis based on word counting
 * Returns positive, negative, or neutral
 */
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    // Clean word of punctuation
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');

    if (POSITIVE_WORDS.includes(cleanWord)) {
      positiveCount++;
    }
    if (NEGATIVE_WORDS.includes(cleanWord)) {
      negativeCount++;
    }
  }

  // Calculate net sentiment
  const netSentiment = positiveCount - negativeCount;

  if (netSentiment > 0) return 'positive';
  if (netSentiment < 0) return 'negative';
  return 'neutral';
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Check if cast has media (images, videos, etc.)
 */
export function hasMedia(cast: Cast): boolean {
  return cast.embeds.some((embed) => {
    if (!embed.url) return false;
    // Check for common media extensions/patterns
    const url = embed.url.toLowerCase();
    return (
      url.includes('image') ||
      url.includes('video') ||
      url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)($|\?)/) !== null ||
      url.includes('imgur') ||
      url.includes('giphy')
    );
  });
}

/**
 * Check if cast has external links (non-media)
 */
export function hasLinks(cast: Cast): boolean {
  return cast.embeds.some((embed) => {
    if (!embed.url) return false;
    const url = embed.url.toLowerCase();
    // Exclude media URLs
    const isMedia =
      url.includes('image') ||
      url.includes('video') ||
      url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)($|\?)/) !== null;
    return !isMedia;
  });
}

/**
 * Extract all content features for a cast
 */
export function extractContentFeatures(cast: Cast): CastContentFeatures {
  const ctaWords = detectCTAs(cast.text);

  return {
    castHash: cast.hash,
    hasQuestion: hasQuestion(cast.text),
    hasCTA: ctaWords.length > 0,
    ctaWords,
    sentiment: analyzeSentiment(cast.text),
    wordCount: countWords(cast.text),
    hasMedia: hasMedia(cast),
    hasMentions: cast.mentions.length > 0,
    hasLinks: hasLinks(cast),
  };
}

/**
 * Batch extract content features for multiple casts
 */
export function extractBatchContentFeatures(
  casts: Cast[]
): Map<string, CastContentFeatures> {
  const featuresMap = new Map<string, CastContentFeatures>();

  for (const cast of casts) {
    featuresMap.set(cast.hash, extractContentFeatures(cast));
  }

  return featuresMap;
}

/**
 * Analyze correlation between content features and engagement
 */
export function analyzeFeatureCorrelation(
  featuresMap: Map<string, CastContentFeatures>,
  engagementScores: Map<string, number>
): {
  questionImpact: number;
  ctaImpact: number;
  mediaImpact: number;
  avgWordCountTop: number;
  avgWordCountBottom: number;
} {
  const castsWithQuestion: number[] = [];
  const castsWithoutQuestion: number[] = [];
  const castsWithCTA: number[] = [];
  const castsWithoutCTA: number[] = [];
  const castsWithMedia: number[] = [];
  const castsWithoutMedia: number[] = [];

  for (const [hash, features] of featuresMap) {
    const score = engagementScores.get(hash) ?? 0;

    if (features.hasQuestion) {
      castsWithQuestion.push(score);
    } else {
      castsWithoutQuestion.push(score);
    }

    if (features.hasCTA) {
      castsWithCTA.push(score);
    } else {
      castsWithoutCTA.push(score);
    }

    if (features.hasMedia) {
      castsWithMedia.push(score);
    } else {
      castsWithoutMedia.push(score);
    }
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgWithQuestion = avg(castsWithQuestion);
  const avgWithoutQuestion = avg(castsWithoutQuestion);
  const avgWithCTA = avg(castsWithCTA);
  const avgWithoutCTA = avg(castsWithoutCTA);
  const avgWithMedia = avg(castsWithMedia);
  const avgWithoutMedia = avg(castsWithoutMedia);

  // Calculate impact as % difference
  const questionImpact =
    avgWithoutQuestion > 0
      ? ((avgWithQuestion - avgWithoutQuestion) / avgWithoutQuestion) * 100
      : 0;
  const ctaImpact =
    avgWithoutCTA > 0 ? ((avgWithCTA - avgWithoutCTA) / avgWithoutCTA) * 100 : 0;
  const mediaImpact =
    avgWithoutMedia > 0
      ? ((avgWithMedia - avgWithoutMedia) / avgWithoutMedia) * 100
      : 0;

  // Get word counts for top/bottom performers
  const sortedByEngagement = [...engagementScores.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const topN = Math.ceil(sortedByEngagement.length * 0.2);
  const bottomN = Math.ceil(sortedByEngagement.length * 0.2);

  const topHashes = sortedByEngagement.slice(0, topN).map(([hash]) => hash);
  const bottomHashes = sortedByEngagement.slice(-bottomN).map(([hash]) => hash);

  const topWordCounts = topHashes
    .map((h) => featuresMap.get(h)?.wordCount ?? 0)
    .filter((w) => w > 0);
  const bottomWordCounts = bottomHashes
    .map((h) => featuresMap.get(h)?.wordCount ?? 0)
    .filter((w) => w > 0);

  return {
    questionImpact,
    ctaImpact,
    mediaImpact,
    avgWordCountTop: avg(topWordCounts),
    avgWordCountBottom: avg(bottomWordCounts),
  };
}
