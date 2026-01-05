import type { FarcasterUser, Cast, CastEngagement, Reaction, Reply } from '@/types';

// Abstract interface for Farcaster data providers
// This allows swapping between Neynar, Warpcast API, or direct hub access

export interface FarcasterProvider {
  // Get user by FID
  getUserByFid(fid: number): Promise<FarcasterUser | null>;

  // Get user by username
  getUserByUsername(username: string): Promise<FarcasterUser | null>;

  // Get recent casts by a user
  getCastsByFid(fid: number, limit?: number): Promise<Cast[]>;

  // Get engagement data for a cast
  getCastEngagement(castHash: string): Promise<CastEngagement>;

  // Get replies to a cast
  getCastReplies(castHash: string): Promise<Reply[]>;

  // Get reactions to a cast
  getCastReactions(castHash: string): Promise<Reaction[]>;

  // Batch fetch engagement for multiple casts (more efficient)
  getBatchEngagement(castHashes: string[]): Promise<Map<string, CastEngagement>>;

  // Get casts a user has replied to (for reciprocity calculation)
  getUserReplies(fid: number, limit?: number): Promise<Cast[]>;
}

// Factory function to get the configured provider
export function getFarcasterProvider(): FarcasterProvider {
  // Currently only Neynar is implemented
  // Could add logic here to switch based on config
  const { NeynarProvider } = require('./neynar');
  return new NeynarProvider();
}
