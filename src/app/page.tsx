'use client';

import { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import type { AnalysisResult } from '@/types';
import { AnalysisResults } from '@/components/AnalysisResults';
import { LoadingProgress } from '@/components/ui';

type AppState = 'loading' | 'analyzing' | 'success' | 'error' | 'not-in-miniapp';

interface MiniAppUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export default function Home() {
  const [state, setState] = useState<AppState>('loading');
  const [user, setUser] = useState<MiniAppUser | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ stage: '', value: 0 });

  // Initialize SDK and get user context
  useEffect(() => {
    async function init() {
      try {
        // Get the context (it's a Promise)
        const context = await sdk.context;

        // Check if we're in a mini app context
        if (!context?.user) {
          setState('not-in-miniapp');
          return;
        }

        const contextUser = context.user;
        setUser({
          fid: contextUser.fid,
          username: contextUser.username,
          displayName: contextUser.displayName,
          pfpUrl: contextUser.pfpUrl,
        });

        // Signal that the app is ready
        await sdk.actions.ready();

        // Start analysis automatically
        setState('analyzing');
        await runAnalysis(contextUser.fid);
      } catch (err) {
        console.error('Init error:', err);
        // Might not be in mini app context - show fallback
        setState('not-in-miniapp');
      }
    }

    init();
  }, []);

  const runAnalysis = useCallback(async (fid: number) => {
    setProgress({ stage: 'Starting analysis...', value: 5 });

    try {
      // Simulate progress stages
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev.value >= 90) return prev;

          const stages = [
            { stage: 'Fetching your casts...', value: 15 },
            { stage: 'Computing engagement metrics...', value: 35 },
            { stage: 'Analyzing content patterns...', value: 50 },
            { stage: 'Identifying themes...', value: 65 },
            { stage: 'Generating feedback...', value: 80 },
            { stage: 'Creating your brief...', value: 90 },
          ];

          const nextStage = stages.find((s) => s.value > prev.value);
          return nextStage || prev;
        });
      }, 2500);

      // Use Quick Auth for authenticated request
      const response = await sdk.quickAuth.fetch(`/api/analyze?fid=${fid}`);
      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setProgress({ stage: 'Done!', value: 100 });
      setResult(data.data);
      setState('success');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (user) {
      setState('analyzing');
      setError(null);
      runAnalysis(user.fid);
    }
  }, [user, runAnalysis]);

  // Not in mini app - show instructions
  if (state === 'not-in-miniapp') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Tune
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Open this app in a Farcaster client to get AI-powered feedback on your posts.
          </p>
          <a
            href="https://farcaster.xyz"
            className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            Get Farcaster
          </a>
        </div>
      </div>
    );
  }

  // Loading SDK
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  // Analyzing
  if (state === 'analyzing') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Hey {user?.displayName || user?.username || 'there'}!
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Analyzing your Farcaster presence...
        </p>
        <div className="w-full max-w-md">
          <LoadingProgress stage={progress.stage} progress={progress.value} />
        </div>
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Success - show results
  if (state === 'success' && result) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <AnalysisResults result={result} onReset={handleRetry} />
        </main>
      </div>
    );
  }

  return null;
}
