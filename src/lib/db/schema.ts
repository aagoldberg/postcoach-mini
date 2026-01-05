import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

// Cached analysis results - expires after 6 hours
export const analysisCache = pgTable('postcoach_analysis_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  fid: integer('fid').notNull(),
  username: text('username'),
  analysisJson: jsonb('analysis_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Rate limiting table
export const rateLimits = pgTable('postcoach_rate_limits', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(), // IP or user identifier
  endpoint: text('endpoint').notNull(),
  requestCount: integer('request_count').default(0).notNull(),
  windowStart: timestamp('window_start').defaultNow().notNull(),
});

// Optional: Store embeddings for faster re-analysis
export const castEmbeddings = pgTable('postcoach_cast_embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  castHash: text('cast_hash').notNull().unique(),
  fid: integer('fid').notNull(),
  embedding: jsonb('embedding').notNull(), // Store as JSON array
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AnalysisCache = typeof analysisCache.$inferSelect;
export type NewAnalysisCache = typeof analysisCache.$inferInsert;
export type RateLimit = typeof rateLimits.$inferSelect;
export type CastEmbedding = typeof castEmbeddings.$inferSelect;
