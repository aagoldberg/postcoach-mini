import { eq, and, gt } from 'drizzle-orm';
import { getDb, schema } from './client';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory fallback for rate limiting
const memoryRateLimits = new Map<string, { count: number; windowStart: Date }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<RateLimitResult> {
  const key = `${identifier}:${endpoint}`;
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const resetAt = new Date(Date.now() + RATE_LIMIT_WINDOW_MS);

  const db = getDb();
  if (db) {
    try {
      // Get current rate limit record
      const records = await db
        .select()
        .from(schema.rateLimits)
        .where(
          and(
            eq(schema.rateLimits.identifier, identifier),
            eq(schema.rateLimits.endpoint, endpoint),
            gt(schema.rateLimits.windowStart, windowStart)
          )
        )
        .limit(1);

      if (records.length === 0) {
        // Create new rate limit record
        await db.insert(schema.rateLimits).values({
          identifier,
          endpoint,
          requestCount: 1,
          windowStart: new Date(),
        });
        return {
          allowed: true,
          remaining: MAX_REQUESTS_PER_WINDOW - 1,
          resetAt,
        };
      }

      const record = records[0];
      const newCount = record.requestCount + 1;

      if (newCount > MAX_REQUESTS_PER_WINDOW) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(record.windowStart.getTime() + RATE_LIMIT_WINDOW_MS),
        };
      }

      // Update count
      await db
        .update(schema.rateLimits)
        .set({ requestCount: newCount })
        .where(eq(schema.rateLimits.id, record.id));

      return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - newCount,
        resetAt: new Date(record.windowStart.getTime() + RATE_LIMIT_WINDOW_MS),
      };
    } catch (error) {
      console.error('Rate limit DB error:', error);
      // Fall through to memory implementation
    }
  }

  // Memory-based rate limiting fallback
  const cached = memoryRateLimits.get(key);
  const now = new Date();

  if (!cached || cached.windowStart < windowStart) {
    memoryRateLimits.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt,
    };
  }

  cached.count++;
  if (cached.count > MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(cached.windowStart.getTime() + RATE_LIMIT_WINDOW_MS),
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - cached.count,
    resetAt: new Date(cached.windowStart.getTime() + RATE_LIMIT_WINDOW_MS),
  };
}

// Clean up old entries periodically
export function cleanupRateLimits() {
  const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS * 2);
  for (const [key, value] of memoryRateLimits.entries()) {
    if (value.windowStart < cutoff) {
      memoryRateLimits.delete(key);
    }
  }
}
