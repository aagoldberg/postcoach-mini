# Tenor: Technical Architecture

A deep dive into how Tenor analyzes your Farcaster presence and generates personalized coaching insights.

## Overview

Tenor combines engagement analytics, content feature extraction, topic clustering, and LLM-powered insights to help creators understand what makes their content resonate. The system is designed to make every user feel like it "gets them" through aggressive personalization at every layer.

## Data Pipeline

```
Farcaster (Neynar API)
        │
        ▼
┌───────────────────┐
│  User Profile     │  FID, username, follower counts
│  Cast History     │  Last 100 posts, 30-day window
│  Engagement Data  │  Likes, recasts, replies per post
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Metrics Engine   │  Engagement scores, velocity, depth
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Content Analysis │  Questions, CTAs, sentiment, media
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Topic Clustering │  TF-IDF + K-means (k=7)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  LLM Layer        │  Claude Sonnet 4
│  (Personalized)   │  Feedback, labels, weekly brief
└───────────────────┘
        │
        ▼
    AnalysisResult
```

---

## 1. Engagement Scoring

Every cast gets an **engagement score** that weights interaction types by depth of engagement:

```
Score = (replies × 3) + (recasts × 2) + (likes × 1)
```

**Why these weights?**
- **Replies (3x)**: Indicates someone took time to respond—highest signal
- **Recasts (2x)**: User endorsed content to their audience
- **Likes (1x)**: Low-friction, baseline engagement

### Velocity Score

Measures early momentum—how quickly engagement happens:

```
Velocity = (replies in first 6 hours) / (total replies)
```

High velocity indicates content that sparks immediate conversation, a key signal for algorithmic distribution.

### Conversation Depth

```
Depth = log₂(replies + 1)
```

Logarithmic scaling prevents outlier posts from skewing analysis while rewarding conversation-starters.

---

## 2. User-Level Metrics

Aggregated metrics computed over your 30-day history:

| Metric | What It Measures |
|--------|------------------|
| **Median Engagement** | Your typical post performance (resistant to outliers) |
| **Reply Rate** | % of posts that got at least one reply |
| **Repeat Replier Rate** | % of your repliers who came back 2+ times |
| **Reciprocity Rate** | % of people you engage with who engage back |

### Why Median, Not Average?

One viral post can 10x your average. Median gives a realistic baseline of "normal" performance, making comparisons meaningful.

---

## 3. Content Feature Extraction

Every post is analyzed for structural patterns that correlate with engagement:

### Features Detected

| Feature | Detection Method |
|---------|------------------|
| **Questions** | `?` character + question word starters (who, what, how, etc.) |
| **CTAs** | 28 trigger phrases: "thoughts?", "lmk", "what do you think", etc. |
| **Sentiment** | 60+ positive words, 50+ negative words (crypto-aware: "bullish", "rugpull") |
| **Media** | Image/video URL patterns in embeds |
| **Word Count** | Simple tokenization |
| **Mentions** | Tagged users from cast metadata |

### Feature Impact Correlation

For each feature, we calculate:

```
Impact = ((avg_score_with_feature - avg_score_without) / avg_score_without) × 100%
```

This tells you: "Your posts with questions get 47% more engagement than posts without."

**This is personalized to YOUR data**, not global averages.

---

## 4. Topic Clustering

We identify what you talk about and which topics perform best.

### TF-IDF Vectorization

1. **Tokenize**: Lowercase, remove URLs, keep only letters
2. **Filter**: Remove 115 stop words + words appearing in <2 or >80% of posts
3. **Weight**: TF-IDF = Term Frequency × Inverse Document Frequency
4. **Normalize**: L2 norm for cosine similarity

### K-Means Clustering

- **K=7** topic clusters by default
- **Initialization**: K-means++ for smart centroid seeding
- **Convergence**: Iterates until centroids stabilize (max 100 iterations)

### Cluster Labeling

1. Extract top 3 keywords per cluster (highest centroid dimensions)
2. Send sample posts + keywords to Claude
3. Claude returns human-readable label: "AI Discussion", "Market Analysis", etc.

**Output**: Your topics ranked by average engagement, showing which themes resonate.

---

## 5. LLM Personalization Layer

Claude Sonnet 4 powers all text generation with aggressive personalization.

### Cast Feedback Generation

For your **top 5** and **bottom 5** posts, Claude receives:

```
POST TEXT: [your actual post]

YOUR METRICS:
- Engagement Score: 47 (156% above YOUR median)
- Likes: 12, Recasts: 3, Replies: 8
- Reply Velocity: 75% in first 6 hours

YOUR CONTENT FEATURES:
- Has question: true
- Has CTA: true ("thoughts?")
- Sentiment: positive
- Theme: "AI Discussion"

Classification: TOP PERFORMER
```

**Key personalization points:**
- Compared to YOUR median, not global average
- YOUR content feature patterns
- YOUR topic themes

Claude outputs:
- **Likely causes**: Why this specific post worked/failed
- **What to replicate**: Patterns to repeat (for top posts)
- **What to avoid**: Problems to fix (for bottom posts)

### Weekly Brief Generation

Claude synthesizes everything into actionable insights:

**Input context:**
- Your 30-day metrics summary
- Your top 5 themes by engagement
- Feature correlation data (questions, CTAs, media impact)
- Sample top/bottom posts

**Output structure:**

```json
{
  "win": {
    "title": "Your strength this week",
    "description": "What's working",
    "metric": "Specific number",
    "value": "47%"
  },
  "weakness": {
    "title": "Your bottleneck",
    "description": "What's holding you back",
    "metric": "Specific number",
    "value": "12%"
  },
  "experiment": {
    "title": "Action to try",
    "description": "Why this helps",
    "templateCast": "Example post you can actually use",
    "rationale": "How this addresses your weakness"
  }
}
```

The **template cast** is generated specifically for YOUR voice, topics, and gaps.

---

## 6. How It "Gets You"

The system achieves personalization through layered context:

### Layer 1: Baseline Personalization
- All metrics compared to YOUR historical median
- Not global benchmarks or "industry averages"

### Layer 2: Feature Correlation
- Shows which content patterns work for YOU
- "Your posts with questions get 47% more engagement"
- Not generic advice like "ask questions"

### Layer 3: Topic Context
- Identifies YOUR dominant themes
- Shows which of YOUR topics resonate
- Feedback tagged with YOUR theme labels

### Layer 4: Reciprocity Analysis
- Tracks who YOU engage with
- Measures who engages back with YOU
- Unique social graph insight

### Layer 5: LLM Contextual Prompting
- Every LLM call includes YOUR specific data
- Comparisons anchored to YOUR baselines
- Template casts reflect YOUR voice and topics

### Layer 6: Feedback Differentiation
- Top posts: "What to replicate"
- Bottom posts: "What to avoid"
- Different prompts, different insights

---

## 7. Scaling with Usage

As users return over time, the system naturally improves:

### Data Accumulation
- More posts = more robust median baselines
- More engagement data = better feature correlation
- More topics = richer clustering

### Pattern Recognition
- LLM sees larger sample of your content style
- Better identification of YOUR voice patterns
- More nuanced "what to replicate" insights

### Reciprocity Graph
- Longer history = better social graph understanding
- Identifies your true community (repeat engagers)
- More accurate reciprocity calculations

---

## 8. Technical Configuration

```typescript
{
  maxCasts: 100,           // Posts analyzed per session
  daysBack: 30,            // Rolling analysis window
  velocityWindowHours: 6,  // Early engagement window
  topN: 5,                 // Top performers highlighted
  bottomN: 5,              // Bottom performers analyzed
  clusterCount: 7,         // Topic clusters
  engagementWeights: {
    reply: 3,
    recast: 2,
    like: 1
  }
}
```

---

## 9. API Architecture

### Data Source: Neynar API
- `/farcaster/user/bulk` - Profile data
- `/farcaster/feed/user/casts` - Post history
- `/farcaster/casts` - Bulk engagement fetch
- `/farcaster/cast/conversation` - Reply threads

### LLM: Anthropic Claude
- Model: `claude-sonnet-4-20250514`
- Temperature: 0.3 (deterministic)
- Concurrency: 3 parallel requests
- Structured JSON output

---

## 10. Files Reference

| Component | Files |
|-----------|-------|
| Pipeline Orchestration | `src/lib/analysis/pipeline.ts` |
| Engagement Metrics | `src/lib/analysis/metrics.ts` |
| Content Features | `src/lib/analysis/content.ts` |
| Topic Clustering | `src/lib/analysis/clustering.ts` |
| LLM Client | `src/lib/llm/client.ts` |
| Feedback Generation | `src/lib/llm/feedback.ts` |
| Prompt Templates | `src/lib/llm/prompts.ts` |
| Farcaster Provider | `src/lib/farcaster/neynar.ts` |
| Type Definitions | `src/types/index.ts` |

---

## Summary

Tenor isn't a generic analytics dashboard. It's a personalized coaching system that:

1. **Measures what matters to YOU** (not global benchmarks)
2. **Identifies YOUR patterns** (not generic best practices)
3. **Speaks to YOUR context** (topics, voice, community)
4. **Suggests YOUR next move** (actionable, specific, templated)

Every number, insight, and recommendation is anchored to your specific Farcaster presence. That's how it "gets you."
