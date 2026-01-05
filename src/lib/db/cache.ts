import { eq, and, gt } from 'drizzle-orm';
import { getDb, schema } from './client';
import type { AnalysisResult } from '@/types';

const CACHE_DURATION_HOURS = 6;

// In-memory fallback cache when DB is unavailable
const memoryCache = new Map<number, { data: AnalysisResult; expiresAt: Date }>();

export async function getCachedAnalysis(fid: number): Promise<AnalysisResult | null> {
  // Try database first
  const db = getDb();
  if (db) {
    try {
      const cached = await db
        .select()
        .from(schema.analysisCache)
        .where(
          and(
            eq(schema.analysisCache.fid, fid),
            gt(schema.analysisCache.expiresAt, new Date())
          )
        )
        .limit(1);

      if (cached.length > 0) {
        const result = cached[0].analysisJson as AnalysisResult;
        result.cached = true;
        return result;
      }
    } catch (error) {
      console.error('DB cache read error:', error);
    }
  }

  // Fallback to memory cache
  const memoryCached = memoryCache.get(fid);
  if (memoryCached && memoryCached.expiresAt > new Date()) {
    memoryCached.data.cached = true;
    return memoryCached.data;
  }

  return null;
}

export async function setCachedAnalysis(fid: number, username: string | null, analysis: AnalysisResult): Promise<void> {
  const expiresAt = new Date(Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000);

  // Try database first
  const db = getDb();
  if (db) {
    try {
      // Delete old cache entries for this user
      await db
        .delete(schema.analysisCache)
        .where(eq(schema.analysisCache.fid, fid));

      // Insert new cache entry
      await db.insert(schema.analysisCache).values({
        fid,
        username,
        analysisJson: analysis,
        expiresAt,
      });
      return;
    } catch (error) {
      console.error('DB cache write error:', error);
    }
  }

  // Fallback to memory cache
  memoryCache.set(fid, { data: analysis, expiresAt });

  // Clean up expired entries periodically
  if (memoryCache.size > 100) {
    const now = new Date();
    for (const [key, value] of memoryCache.entries()) {
      if (value.expiresAt < now) {
        memoryCache.delete(key);
      }
    }
  }
}

export async function invalidateCache(fid: number): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      await db
        .delete(schema.analysisCache)
        .where(eq(schema.analysisCache.fid, fid));
    } catch (error) {
      console.error('DB cache invalidate error:', error);
    }
  }

  memoryCache.delete(fid);
}
