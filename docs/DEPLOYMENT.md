# Deployment

## Platform

Vercel (Next.js framework preset).

## Commands

```bash
bun install
bun run build
vercel          # preview
vercel --prod   # production
```

## Config

- `vercel.json` sets `framework: nextjs` and `buildCommand: bun run build`.
- No required environment variables for v1 (static content).

## Smoke after deploy

1. Open production URL
2. Confirm hero brand “Theo Douwes”
3. Confirm `#work` shows Navigara
4. Confirm LinkedIn CTA is present
