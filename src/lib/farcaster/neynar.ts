import type { FarcasterProvider } from './provider';
import type { FarcasterUser, Cast, CastEngagement, Reaction, Reply } from '@/types';
import type {
  NeynarUser,
  NeynarCast,
  NeynarCastsResponse,
  NeynarUserResponse,
  NeynarRepliesResponse,
} from './types';

const NEYNAR_API_BASE = 'https://api.neynar.com/v2';

export class NeynarProvider implements FarcasterProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEYNAR_API_KEY || '';
    if (!this.apiKey) {
      console.warn('NEYNAR_API_KEY not set');
    }
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${NEYNAR_API_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
        api_key: this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Neynar API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private transformUser(neynarUser: NeynarUser): FarcasterUser {
    return {
      fid: neynarUser.fid,
      username: neynarUser.username,
      displayName: neynarUser.display_name,
      pfpUrl: neynarUser.pfp_url,
      bio: neynarUser.profile?.bio?.text || null,
      followerCount: neynarUser.follower_count,
      followingCount: neynarUser.following_count,
    };
  }

  private transformCast(neynarCast: NeynarCast): Cast {
    return {
      hash: neynarCast.hash,
      fid: neynarCast.author.fid,
      text: neynarCast.text,
      timestamp: new Date(neynarCast.timestamp),
      parentHash: neynarCast.parent_hash,
      parentUrl: neynarCast.parent_url,
      embeds: neynarCast.embeds.map((e) => ({
        url: e.url,
        castId: e.cast_id,
      })),
      mentions: neynarCast.mentioned_profiles?.map((p) => p.fid) || [],
      mentionsPositions: [], // Not available in basic response
    };
  }

  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    try {
      const response = await this.fetch<NeynarUserResponse>('/farcaster/user/bulk', {
        fids: fid.toString(),
      });

      if (response.users.length === 0) return null;
      return this.transformUser(response.users[0]);
    } catch (error) {
      console.error('Error fetching user by FID:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<FarcasterUser | null> {
    try {
      const response = await this.fetch<{ user: NeynarUser }>(
        '/farcaster/user/by_username',
        { username }
      );

      return this.transformUser(response.user);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  async getCastsByFid(fid: number, limit: number = 100): Promise<Cast[]> {
    const casts: Cast[] = [];
    let cursor: string | undefined;

    try {
      while (casts.length < limit) {
        const params: Record<string, string> = {
          fid: fid.toString(),
          limit: Math.min(50, limit - casts.length).toString(),
          include_replies: 'false', // Only get top-level casts
        };

        if (cursor) {
          params.cursor = cursor;
        }

        const response = await this.fetch<NeynarCastsResponse>(
          '/farcaster/feed/user/casts',
          params
        );

        for (const neynarCast of response.casts) {
          casts.push(this.transformCast(neynarCast));
        }

        if (!response.next?.cursor || response.casts.length === 0) {
          break;
        }

        cursor = response.next.cursor;
      }

      return casts;
    } catch (error) {
      console.error('Error fetching casts:', error);
      return casts;
    }
  }

  async getCastEngagement(castHash: string): Promise<CastEngagement> {
    try {
      // Get cast details including reactions
      const response = await this.fetch<{ cast: NeynarCast }>('/farcaster/cast', {
        identifier: castHash,
        type: 'hash',
      });

      const cast = response.cast;
      const reactions: Reaction[] = [];

      // Transform likes
      for (const like of cast.reactions.likes || []) {
        reactions.push({
          fid: like.fid,
          timestamp: new Date(), // Neynar doesn't provide reaction timestamps in basic response
          type: 'like',
        });
      }

      // Transform recasts
      for (const recast of cast.reactions.recasts || []) {
        reactions.push({
          fid: recast.fid,
          timestamp: new Date(),
          type: 'recast',
        });
      }

      // Get replies
      const replies = await this.getCastReplies(castHash);
      const uniqueRepliers = [...new Set(replies.map((r) => r.fid))];

      return {
        castHash,
        likesCount: cast.reactions.likes_count,
        recastsCount: cast.reactions.recasts_count,
        repliesCount: cast.replies.count,
        uniqueRepliers,
        reactions,
        replies,
      };
    } catch (error) {
      console.error('Error fetching cast engagement:', error);
      return {
        castHash,
        likesCount: 0,
        recastsCount: 0,
        repliesCount: 0,
        uniqueRepliers: [],
        reactions: [],
        replies: [],
      };
    }
  }

  async getCastReplies(castHash: string): Promise<Reply[]> {
    try {
      const response = await this.fetch<NeynarRepliesResponse>(
        '/farcaster/cast/conversation',
        {
          identifier: castHash,
          type: 'hash',
          reply_depth: '1',
          limit: '50',
        }
      );

      const directReplies = response.conversation?.cast?.direct_replies || [];

      return directReplies.map((reply) => ({
        hash: reply.hash,
        fid: reply.author.fid,
        text: reply.text,
        timestamp: new Date(reply.timestamp),
        parentHash: castHash,
      }));
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  }

  async getCastReactions(castHash: string): Promise<Reaction[]> {
    // This is handled in getCastEngagement for efficiency
    const engagement = await this.getCastEngagement(castHash);
    return engagement.reactions;
  }

  async getBatchEngagement(castHashes: string[]): Promise<Map<string, CastEngagement>> {
    const results = new Map<string, CastEngagement>();

    // Neynar has a bulk cast endpoint
    try {
      // Process in batches of 100 (API limit)
      const batchSize = 100;
      for (let i = 0; i < castHashes.length; i += batchSize) {
        const batch = castHashes.slice(i, i + batchSize);

        const response = await this.fetch<{ result: { casts: NeynarCast[] } }>(
          '/farcaster/casts',
          {
            casts: batch.join(','),
          }
        );

        for (const cast of response.result.casts) {
          const uniqueRepliers: number[] = []; // Would need separate call for each

          results.set(cast.hash, {
            castHash: cast.hash,
            likesCount: cast.reactions.likes_count,
            recastsCount: cast.reactions.recasts_count,
            repliesCount: cast.replies.count,
            uniqueRepliers,
            reactions: [
              ...(cast.reactions.likes || []).map((l) => ({
                fid: l.fid,
                timestamp: new Date(),
                type: 'like' as const,
              })),
              ...(cast.reactions.recasts || []).map((r) => ({
                fid: r.fid,
                timestamp: new Date(),
                type: 'recast' as const,
              })),
            ],
            replies: [],
          });
        }
      }
    } catch (error) {
      console.error('Error in batch engagement fetch:', error);

      // Fall back to individual fetches
      for (const hash of castHashes) {
        if (!results.has(hash)) {
          results.set(hash, await this.getCastEngagement(hash));
        }
      }
    }

    return results;
  }

  async getUserReplies(fid: number, limit: number = 100): Promise<Cast[]> {
    const casts: Cast[] = [];
    let cursor: string | undefined;

    try {
      while (casts.length < limit) {
        const params: Record<string, string> = {
          fid: fid.toString(),
          limit: Math.min(50, limit - casts.length).toString(),
          include_replies: 'true', // Include replies
        };

        if (cursor) {
          params.cursor = cursor;
        }

        const response = await this.fetch<NeynarCastsResponse>(
          '/farcaster/feed/user/casts',
          params
        );

        for (const neynarCast of response.casts) {
          // Only include actual replies (casts with parent)
          if (neynarCast.parent_hash) {
            casts.push(this.transformCast(neynarCast));
          }
        }

        if (!response.next?.cursor || response.casts.length === 0) {
          break;
        }

        cursor = response.next.cursor;
      }

      return casts;
    } catch (error) {
      console.error('Error fetching user replies:', error);
      return casts;
    }
  }
}
