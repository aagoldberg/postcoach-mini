'use client';

/* eslint-disable @next/next/no-img-element */
import { Card } from '@/components/ui';
import type { FarcasterUser } from '@/types';

interface UserHeaderProps {
  user: {
    username?: string;
    displayName?: string;
    pfpUrl?: string | null;
    fid?: number;
    followerCount?: number;
    followingCount?: number;
  };
}

export function UserHeader({ user }: UserHeaderProps) {
  const followerCount = user.followerCount ?? 0;
  const followingCount = user.followingCount ?? 0;

  return (
    <Card className="p-5 bg-white overflow-visible flex items-center gap-4">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-stone-100 flex-shrink-0 bg-stone-100">
        {user.pfpUrl ? (
          <img
            src={user.pfpUrl}
            alt={user.displayName || 'User'}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-stone-400">
            {user.displayName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-black text-[#1a1f2e] tracking-tight truncate leading-tight">
          {user.displayName}
        </h1>
        <p className="text-stone-400 font-bold text-[10px] tracking-widest uppercase truncate">
          @{user.username}
        </p>
      </div>

      <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider text-stone-400 flex-shrink-0">
        <div className="text-center">
          <span className="block text-sm text-[#1a1f2e] font-black tracking-tight leading-none">
            {followerCount.toLocaleString()}
          </span>
          <span>followers</span>
        </div>
        <div className="text-center">
          <span className="block text-sm text-[#1a1f2e] font-black tracking-tight leading-none">
            {followingCount.toLocaleString()}
          </span>
          <span>following</span>
        </div>
      </div>
    </Card>
  );
}
