import { NextRequest, NextResponse } from 'next/server';
import { createClient, Errors } from '@farcaster/quick-auth';
import { runAnalysisPipeline } from '@/lib/analysis/pipeline';
import { getCachedAnalysis, setCachedAnalysis, checkRateLimit } from '@/lib/db';
import type { AnalyzeResponse } from '@/types';

export const maxDuration = 60;

const quickAuthClient = createClient();

// Get domain from environment or default
const getDomain = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname;
  }
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL;
  }
  return 'localhost';
};

export async function GET(request: NextRequest) {
  try {
    // Get FID from query params
    const searchParams = request.nextUrl.searchParams;
    const fidParam = searchParams.get('fid');

    if (!fidParam) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Missing fid parameter' },
        { status: 400 }
      );
    }

    const fid = parseInt(fidParam, 10);
    if (isNaN(fid)) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Invalid fid parameter' },
        { status: 400 }
      );
    }

    // Verify Quick Auth JWT
    const authorization = request.headers.get('Authorization');

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];

      try {
        const domain = getDomain();
        const payload = await quickAuthClient.verifyJwt({ token, domain });
        const authenticatedFid = typeof payload.sub === 'string'
          ? parseInt(payload.sub, 10)
          : payload.sub;

        // Ensure user can only analyze their own account
        if (authenticatedFid !== fid) {
          return NextResponse.json<AnalyzeResponse>(
            { success: false, error: 'You can only analyze your own account' },
            { status: 403 }
          );
        }
      } catch (e) {
        if (e instanceof Errors.InvalidTokenError) {
          return NextResponse.json<AnalyzeResponse>(
            { success: false, error: 'Invalid authentication token' },
            { status: 401 }
          );
        }
        // Log but continue - might be in dev mode
        console.warn('JWT verification failed:', e);
      }
    }

    // Rate limiting by FID
    const rateLimit = await checkRateLimit(`fid:${fid}`, '/api/analyze');

    if (!rateLimit.allowed) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: `Rate limit exceeded. Try again later.`,
        },
        { status: 429 }
      );
    }

    // Check cache
    const cached = await getCachedAnalysis(fid);
    if (cached) {
      return NextResponse.json<AnalyzeResponse>({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Run analysis pipeline
    const result = await runAnalysisPipeline(fid);

    // Cache result
    await setCachedAnalysis(result.user.fid, result.user.username, result);

    return NextResponse.json<AnalyzeResponse>({
      success: true,
      data: result,
      cached: false,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';

    return NextResponse.json<AnalyzeResponse>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
