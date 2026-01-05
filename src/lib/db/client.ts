import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Get database URL from environment
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('DATABASE_URL not set - caching disabled');
    return null;
  }
  return url;
};

// Create database client (lazy initialization)
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDb = () => {
  if (db) return db;

  const url = getDatabaseUrl();
  if (!url) return null;

  const sql = neon(url);
  db = drizzle(sql, { schema });
  return db;
};

// Export for direct usage when DB is available
export { schema };
