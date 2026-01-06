# Tenor: Roadmap & Scaling Strategy

Future improvements, cost analysis, and quality enhancements.

---

## Current Limitations

| Constraint | Current State | Impact |
|------------|---------------|--------|
| Cast limit | 100 posts max | Limited historical context |
| Data persistence | None (fresh analysis each time) | No longitudinal tracking |
| Claude context | ~30 sample posts | Misses subtle patterns |
| Data source | Neynar API | Rate limits, latency |

---

## 1. Persistent User History

### The Problem

Each analysis is a **fresh snapshot**. We don't learn about users over time.

### The Solution

Store weekly snapshots per FID:

```sql
CREATE TABLE user_snapshots (
  fid INTEGER,
  week_start DATE,
  metrics JSONB,        -- medians, rates, reciprocity
  themes JSONB,         -- top themes + engagement
  correlations JSONB,   -- feature impacts
  top_posts JSONB,      -- 5 best performers
  bottom_posts JSONB,   -- 5 worst performers
  brief JSONB,          -- win/weakness/experiment
  PRIMARY KEY (fid, week_start)
);

CREATE TABLE recommendations (
  fid INTEGER,
  created_at TIMESTAMP,
  recommendation TEXT,
  followed BOOLEAN,
  outcome_delta FLOAT
);
```

### Storage Costs

| Users | Data/Year | Annual Cost |
|-------|-----------|-------------|
| 1,000 | 260 MB | **Free** |
| 10,000 | 2.6 GB | **~$3/month** |
| 100,000 | 26 GB | **~$25/month** |

Storage is <1% of total operating cost.

### What This Enables

- "Your reply rate improved 23% vs last month"
- "Your AI Discussion posts are trending up"
- "Last week we suggested X—it worked, your engagement jumped 15%"
- Recommendation tracking and feedback loops

### Effort

~1-2 days to implement basic longitudinal tracking.

---

## 2. Expanded Cast Analysis

### Current: 100 Casts

| User Type | Posts/Day | Days Covered |
|-----------|-----------|--------------|
| High volume | 10+ | ~10 days |
| Medium | 3-5 | ~20-30 days |
| Low volume | <1 | 30 days |

Prolific posters lose historical context.

### Proposed Tiers

| Tier | Casts | Days | Use Case |
|------|-------|------|----------|
| Free | 100 | 30 | Quick snapshot |
| Pro | 250 | 60 | Deeper analysis |
| Premium | 500 | 90 | Full historical context |

### Time Impact

| Casts | Current Arch | Optimized |
|-------|--------------|-----------|
| 100 | 15-20s | 8-12s |
| 250 | 25-30s | 12-18s |
| 500 | 35-45s | 18-25s |

### Cost Impact

| Casts | Neynar | Claude | Total |
|-------|--------|--------|-------|
| 100 | ~$0.01 | ~$0.03 | **$0.04** |
| 250 | ~$0.03 | ~$0.05 | **$0.08** |
| 500 | ~$0.05 | ~$0.08 | **$0.13** |

Marginal cost increase for significantly richer analysis.

---

## 3. Full-Context Claude Analysis

### Current Approach

Claude sees ~30 posts (samples):
- 5 samples per cluster × 7 clusters
- Top 5 + bottom 5 for feedback
- 10 samples for weekly brief

### The Limitation

Claude misses:
- Writing style patterns across all posts
- Temporal patterns (weekend vs weekday)
- Topic evolution over time
- Structural patterns (length, format)
- Voice consistency signals
- Cross-post correlations

### Full-Context Approach

Send all 500 posts to Claude:

```
Tokens: 500 posts × ~40 tokens = ~20,000 tokens
Claude limit: 200,000 tokens
Usage: 10% of capacity
```

### Quality Difference

| Approach | Insight Quality |
|----------|-----------------|
| **Sampled** | "Your reply rate is 23%. Try asking more questions." |
| **Full context** | "Your reply rate is 23%, and it spikes when you ask genuine questions about others' projects rather than rhetorical questions. Your Sunday evening posts get 2x engagement. Try: 'What's the hardest part of [specific topic] you're working on?'" |

### Cost

| Context Size | Extra Cost | Extra Time |
|--------------|------------|------------|
| 30 posts (current) | $0 | 0s |
| 100 posts | +$0.03 | +2s |
| 250 posts | +$0.08 | +3s |
| 500 posts | +$0.15 | +5s |

**$0.15 extra for significantly better insights.** Worth it for paid tiers.

---

## 4. Infrastructure: Self-Hosted Hub

### When to Consider

| Neynar Spend | Recommendation |
|--------------|----------------|
| <$200/month | Stay with Neynar |
| $200-500/month | Evaluate hybrid |
| >$500/month | Self-host likely worth it |

### Performance Comparison

| Operation | Neynar | Self-Hosted |
|-----------|--------|-------------|
| Fetch 500 casts | 10-12s | ~500ms |
| Engagement data | 5-6s | ~200ms |
| Rate limits | Yes | No |
| **Total analysis** | **35-40s** | **15-18s** |

Self-hosted cuts data fetch time by 10-50x.

### Cost Comparison

| Scale | Neynar/Month | Self-Hosted/Month |
|-------|--------------|-------------------|
| 1K analyses | ~$50 | ~$50 |
| 10K analyses | ~$200 | ~$60 |
| 100K analyses | ~$1,000+ | ~$100 |

### Requirements

```
Hubble (Farcaster Hub):
- 4+ CPU cores
- 16GB+ RAM
- 500GB+ SSD
- Good network bandwidth

Hosting: ~$50-100/month (Hetzner/OVH)
Setup: 1-2 days + 12-48 hour initial sync
Maintenance: Ongoing updates, monitoring
```

### Recommendation

**Now:** Stick with Neynar. Focus on product-market fit.

**At 10K+ users:** Revisit. Cost savings + speed gains justify ops overhead.

---

## 5. Pricing Model

### Cost Structure Per Analysis

| Component | Free Tier | Pro Tier | Premium Tier |
|-----------|-----------|----------|--------------|
| Casts analyzed | 100 | 250 | 500 |
| Neynar | $0.01 | $0.03 | $0.05 |
| Claude (sampled) | $0.03 | $0.05 | $0.08 |
| Claude (full context) | — | +$0.08 | +$0.15 |
| Storage | $0.001 | $0.001 | $0.001 |
| **Total** | **$0.04** | **$0.16** | **$0.28** |

### Suggested Pricing

| Tier | Price | Analyses/Month | Margin |
|------|-------|----------------|--------|
| Free | $0 | 1 | Loss leader |
| Pro | $8/month | 10 | ~$6.40 profit |
| Premium | $20/month | 30 | ~$11.60 profit |

### Unit Economics

At 1,000 paying users (80% Pro, 20% Premium):

```
Revenue: (800 × $8) + (200 × $20) = $10,400/month

Costs:
- API (Neynar + Claude): ~$2,000
- Infrastructure: ~$200
- Storage: ~$50

Gross profit: ~$8,150/month (78% margin)
```

---

## 6. Quality Improvement Roadmap

### Phase 1: Foundation (Now)
- [x] Basic metrics and clustering
- [x] LLM-powered feedback
- [x] Weekly brief generation

### Phase 2: Persistence (1-2 weeks)
- [ ] User history storage
- [ ] Trend tracking ("up 23% vs last month")
- [ ] Recommendation tracking
- [ ] Returning user experience

### Phase 3: Depth (2-4 weeks)
- [ ] Expanded cast limits (250/500)
- [ ] Full-context Claude analysis
- [ ] Writing style analysis
- [ ] Temporal pattern detection
- [ ] Parallel data fetching

### Phase 4: Scale (When needed)
- [ ] Self-hosted Farcaster hub
- [ ] Caching layer for repeated queries
- [ ] Background processing for heavy analyses
- [ ] Webhook notifications for completed analyses

### Phase 5: Intelligence (Future)
- [ ] Cross-user benchmarking (anonymized)
- [ ] Predictive scoring ("this post will likely get X engagement")
- [ ] A/B test suggestions
- [ ] Optimal posting time recommendations
- [ ] Audience segment analysis

---

## 7. Technical Optimizations

### Quick Wins

| Optimization | Effort | Impact |
|--------------|--------|--------|
| Parallel Neynar fetches | 2 hours | -5s latency |
| Batch Claude calls | 4 hours | -5s latency |
| Progressive loading | 1 day | Better UX |
| Response caching | 2 hours | Faster repeat visits |

### Medium Effort

| Optimization | Effort | Impact |
|--------------|--------|--------|
| Full-context Claude | 1 day | Better insights |
| Persistent history | 2 days | Longitudinal tracking |
| Tiered cast limits | 1 day | Premium differentiation |

### Significant Investment

| Optimization | Effort | Impact |
|--------------|--------|--------|
| Self-hosted hub | 1-2 weeks | 2x speed, lower cost at scale |
| ML-based scoring | 2-4 weeks | Predictive insights |
| Real-time monitoring | 1-2 weeks | Instant feedback on new posts |

---

## 8. Competitive Moat

### What Makes Tenor Defensible

1. **Personalization depth**: Not just your data—your patterns, your voice, your community

2. **Longitudinal tracking**: Gets better the longer you use it

3. **Actionable specificity**: Not "post more" but "your Sunday technical threads about X get 3x engagement"

4. **Full-context LLM**: Claude sees your entire corpus, not summaries

5. **Feedback loops**: Track recommendations → measure outcomes → improve suggestions

### What's Easy to Copy

- Basic metrics (reply rate, engagement score)
- Simple clustering
- Generic LLM feedback

### What's Hard to Copy

- Deep personalization with persistent history
- Recommendation tracking and closed-loop learning
- Full-corpus pattern detection
- User-specific voice and style analysis

---

## Summary

| Investment | Cost | Impact | Priority |
|------------|------|--------|----------|
| Persistent history | 2 days | High | **P0** |
| Full-context Claude | 1 day | High | **P0** |
| Expanded cast limits | 1 day | Medium | **P1** |
| Parallel fetching | 2 hours | Medium | **P1** |
| Self-hosted hub | 1-2 weeks | High (at scale) | **P2** |

**Next steps:**
1. Add persistent user history (biggest unlock for "it gets me")
2. Enable full-context Claude for paid tiers
3. Implement tiered cast limits
4. Optimize latency with parallel fetching

The path from "useful tool" to "indispensable coach" is depth of personalization over time.
