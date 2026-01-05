// System and user prompts for Claude LLM calls

// ============= Cluster Labeling =============

export const CLUSTER_LABEL_SYSTEM = `You are an expert at analyzing social media content themes. Your task is to provide a concise, descriptive label for a group of related posts.

Rules:
- Keep labels to 2-4 words maximum
- Be specific and descriptive
- Use title case
- Focus on the topic/theme, not the format
- Output ONLY the label, nothing else`;

export function getClusterLabelPrompt(sampleTexts: string[], keywords: string[]): string {
  return `Here are sample posts from a cluster:

${sampleTexts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

Keywords extracted: ${keywords.join(', ')}

What is the best 2-4 word label for this topic cluster?`;
}

// ============= Cast Feedback Generation =============

export const CAST_FEEDBACK_SYSTEM = `You are a Farcaster growth coach analyzing post performance. Your job is to explain why a post performed well or poorly and give actionable advice.

Output Format (strict JSON):
{
  "likelyCauses": ["cause 1", "cause 2"],
  "whatToReplicate": ["action 1", "action 2"],
  "whatToAvoid": ["action 1"],
  "summary": "One sentence summary of the key insight"
}

Rules:
- Be specific and actionable
- Reference the actual content and metrics
- Keep each bullet to 1-2 sentences max
- For top performers: focus on what to replicate
- For underperformers: focus on what to avoid/improve
- Consider: timing, format, topic, engagement hooks, length`;

export interface CastFeedbackInput {
  text: string;
  engagementScore: number;
  likesCount: number;
  recastsCount: number;
  repliesCount: number;
  velocityScore: number | null;
  hasQuestion: boolean;
  hasCTA: boolean;
  ctaWords: string[];
  sentiment: string;
  wordCount: number;
  hasMedia: boolean;
  theme: string | null;
  isTopPerformer: boolean;
  medianEngagement: number;
}

export function getCastFeedbackPrompt(input: CastFeedbackInput): string {
  const performanceLabel = input.isTopPerformer ? 'TOP PERFORMER' : 'UNDERPERFORMER';
  const vsMedian = ((input.engagementScore / input.medianEngagement - 1) * 100).toFixed(0);

  return `Analyze this ${performanceLabel} Farcaster post:

POST TEXT:
"${input.text}"

METRICS:
- Engagement Score: ${input.engagementScore} (${vsMedian}% vs median)
- Likes: ${input.likesCount}
- Recasts: ${input.recastsCount}
- Replies: ${input.repliesCount}
- Reply Velocity: ${input.velocityScore !== null ? (input.velocityScore * 100).toFixed(0) + '% in first 6 hours' : 'N/A'}

CONTENT FEATURES:
- Has question: ${input.hasQuestion}
- Has CTA: ${input.hasCTA}${input.hasCTA ? ` (${input.ctaWords.join(', ')})` : ''}
- Sentiment: ${input.sentiment}
- Word count: ${input.wordCount}
- Has media: ${input.hasMedia}
- Theme: ${input.theme || 'Unknown'}

Provide feedback in JSON format:`;
}

// ============= Weekly Brief Generation =============

export const WEEKLY_BRIEF_SYSTEM = `You are a Farcaster influence coach creating a weekly brief for a content creator. Your brief should be immediately actionable and specific.

Output Format (strict JSON):
{
  "win": {
    "title": "Short title (3-5 words)",
    "description": "What improved and why (1-2 sentences)",
    "metric": "metric name",
    "value": "specific value or change"
  },
  "weakness": {
    "title": "Short title (3-5 words)",
    "description": "The bottleneck and its impact (1-2 sentences)",
    "metric": "metric name",
    "value": "specific value"
  },
  "experiment": {
    "title": "Short action title (3-5 words)",
    "description": "What to try and why (1-2 sentences)",
    "templateCast": "An example cast they could post (actual text)",
    "rationale": "Why this experiment addresses the weakness (1 sentence)"
  }
}

Rules:
- Be SPECIFIC - use actual numbers and observations
- Make the experiment directly address the weakness
- The template cast should be immediately usable
- Keep all text concise and scannable`;

export interface WeeklyBriefInput {
  username: string;
  totalCasts: number;
  medianEngagement: number;
  replyRate: number;
  repeatReplierRate: number;
  reciprocityRate: number | null;
  topThemes: string[];
  topPerformingTheme: string | null;
  topPerformingThemeEngagement: number | null;
  questionImpact: number;
  ctaImpact: number;
  avgWordCountTop: number;
  avgWordCountBottom: number;
  topCastSamples: string[];
  bottomCastSamples: string[];
}

export function getWeeklyBriefPrompt(input: WeeklyBriefInput): string {
  return `Create a weekly brief for @${input.username}

OVERVIEW:
- Total casts analyzed: ${input.totalCasts}
- Median engagement score: ${input.medianEngagement.toFixed(1)}
- Reply rate: ${(input.replyRate * 100).toFixed(0)}% of posts got replies
- Repeat replier rate: ${(input.repeatReplierRate * 100).toFixed(0)}% of repliers came back
${input.reciprocityRate !== null ? `- Reciprocity rate: ${(input.reciprocityRate * 100).toFixed(0)}%` : ''}

THEMES:
- Top themes: ${input.topThemes.join(', ') || 'Mixed topics'}
- Best performing theme: ${input.topPerformingTheme || 'N/A'} (avg engagement: ${input.topPerformingThemeEngagement?.toFixed(1) || 'N/A'})

CONTENT ANALYSIS:
- Posts with questions get ${input.questionImpact > 0 ? '+' : ''}${input.questionImpact.toFixed(0)}% engagement
- Posts with CTAs get ${input.ctaImpact > 0 ? '+' : ''}${input.ctaImpact.toFixed(0)}% engagement
- Top posts avg ${input.avgWordCountTop.toFixed(0)} words, bottom posts avg ${input.avgWordCountBottom.toFixed(0)} words

TOP PERFORMING POSTS:
${input.topCastSamples.map((t, i) => `${i + 1}. "${t.slice(0, 100)}..."`).join('\n')}

UNDERPERFORMING POSTS:
${input.bottomCastSamples.map((t, i) => `${i + 1}. "${t.slice(0, 100)}..."`).join('\n')}

Generate a weekly brief in JSON format:`;
}

// ============= Batch Sentiment Analysis (if needed) =============

export const BATCH_SENTIMENT_SYSTEM = `You are analyzing the sentiment of social media posts. For each post, classify the sentiment as positive, neutral, or negative.

Output Format (strict JSON array):
[
  {"id": "1", "sentiment": "positive"},
  {"id": "2", "sentiment": "neutral"},
  ...
]

Rules:
- Consider crypto/tech slang (e.g., "bullish" = positive, "rekt" = negative)
- Neutral is the default if unclear
- Consider emojis and punctuation`;

export function getBatchSentimentPrompt(
  posts: { id: string; text: string }[]
): string {
  return `Classify sentiment for these posts:

${posts.map((p) => `[${p.id}] "${p.text}"`).join('\n\n')}

Output JSON array:`;
}
