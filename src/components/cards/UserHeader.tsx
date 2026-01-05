'use client';

import Image from 'next/image';
import type { FarcasterUser } from '@/types';

interface UserHeaderProps {
  user: FarcasterUser;
}

export function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
        {user.pfpUrl ? (
          <Image
            src={user.pfpUrl}
            alt={user.displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
            {user.displayName[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold truncate">{user.displayName}</h1>
        <p className="text-violet-200 truncate">@{user.username}</p>
        <div className="flex gap-4 mt-2 text-sm">
          <span>
            <strong>{user.followerCount.toLocaleString()}</strong> followers
          </span>
          <span>
            <strong>{user.followingCount.toLocaleString()}</strong> following
          </span>
        </div>
      </div>
    </div>
  );
}
