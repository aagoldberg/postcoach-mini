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
  // MiniAppUser might not have follower counts, use optional chaining or defaults
  const followerCount = user.followerCount ?? 0;
  const followingCount = user.followingCount ?? 0;

  return (
    <Card className="flex flex-col items-center gap-4 p-8 bg-white text-center overflow-visible mt-12">
      <div className="relative w-24 h-24 -mt-16 rounded-[2rem] overflow-hidden border-[6px] border-white shadow-xl flex-shrink-0 bg-stone-100">
        {user.pfpUrl ? (
          <img
            src={user.pfpUrl}
            alt={user.displayName || 'User'}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-stone-100 text-stone-400">
            {user.displayName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#1a1f2e] tracking-tighter serif-heading">
          {user.displayName}
        </h1>
        <p className="text-stone-400 font-bold text-xs tracking-widest uppercase">
          @{user.username}
        </p>
        <div className="flex gap-8 mt-6 pt-6 border-t border-stone-50 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
          <span className="flex flex-col items-center">
            <strong className="text-lg text-[#1a1f2e] font-black tracking-tighter">
              {followerCount.toLocaleString()}
            </strong> followers
          </span>
          <span className="flex flex-col items-center">
            <strong className="text-lg text-[#1a1f2e] font-black tracking-tighter">
              {followingCount.toLocaleString()}
            </strong> following
          </span>
        </div>
      </div>
    </Card>
  );
}