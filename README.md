# Tenor - Farcaster Mini App

A Farcaster Mini App that gives you AI-powered feedback on your posts. Opens in any Farcaster client and automatically analyzes your account - no login required.

## How It Works

1. User opens the mini app in a Farcaster client
2. SDK provides user context (FID, username, etc.)
3. App automatically fetches and analyzes the user's casts
4. Shows personalized feedback and weekly brief

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `NEYNAR_API_KEY` - Farcaster data
- `ANTHROPIC_API_KEY` - AI feedback
- `DATABASE_URL` - Caching (Neon Postgres)
- `NEXT_PUBLIC_APP_URL` - Your deployed URL

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Vercel

Push to GitHub, import in Vercel, add env vars.

### 5. Generate manifest signature

After deploying, go to https://miniapps.farcaster.xyz/docs/guides/publishing to generate your `accountAssociation` signature for `public/.well-known/farcaster.json`.

## Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `NEYNAR_API_KEY` | Your Neynar key |
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `DATABASE_URL` | Neon/Supabase connection string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

## Key Files

- `src/app/page.tsx` - Main mini app UI with SDK integration
- `src/app/api/analyze/route.ts` - Authenticated API with Quick Auth
- `public/.well-known/farcaster.json` - Mini app manifest

## Differences from Web Version

| Feature | Web (postcoach) | Mini App (postcoach-mini) |
|---------|-----------------|---------------------------|
| Auth | None (public) | Quick Auth JWT |
| User Input | Username field | Auto from SDK context |
| Access | Anyone analyzes anyone | Only analyze yourself |
| Distribution | Direct link | Farcaster discovery |
