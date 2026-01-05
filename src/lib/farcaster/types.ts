// Neynar API response types

export interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string | null;
  profile: {
    bio: {
      text: string | null;
    };
  };
  follower_count: number;
  following_count: number;
}

export interface NeynarCast {
  hash: string;
  author: NeynarUser;
  text: string;
  timestamp: string;
  parent_hash: string | null;
  parent_url: string | null;
  embeds: Array<{
    url?: string;
    cast_id?: { fid: number; hash: string };
  }>;
  mentioned_profiles: NeynarUser[];
  reactions: {
    likes_count: number;
    recasts_count: number;
    likes: Array<{ fid: number; fname: string }>;
    recasts: Array<{ fid: number; fname: string }>;
  };
  replies: {
    count: number;
  };
}

export interface NeynarCastsResponse {
  casts: NeynarCast[];
  next?: {
    cursor: string;
  };
}

export interface NeynarUserResponse {
  users: NeynarUser[];
}

export interface NeynarReactionsResponse {
  reactions: Array<{
    reaction_type: 'like' | 'recast';
    user: NeynarUser;
    reaction_timestamp: string;
  }>;
  next?: {
    cursor: string;
  };
}

export interface NeynarRepliesResponse {
  conversation: {
    cast: NeynarCast & {
      direct_replies: NeynarCast[];
    };
  };
}

export interface NeynarBulkCastsResponse {
  result: {
    casts: NeynarCast[];
  };
}
