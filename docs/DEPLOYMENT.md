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
- The static content needs no environment variables. TheoAI (chat) does:

| Var | Required for | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | `/api/chat`, `/status` | Must start `sk-or-`. Missing/malformed → `/api/chat` returns `503 { "error": "Chat is not configured." }`; `/status` shows "no — OPENROUTER_API_KEY missing" and skips the live checks. |
| `CHAT_RATE_SECRET` | `/api/chat` rate limiting | Signs the `theoai_q` cookie. Falls back to `OPENROUTER_API_KEY` if unset — set it explicitly so quota state survives a key rotation. |

Both are already set on the `theodouwes-site` Vercel project.

## Smoke after deploy

1. Open production URL (`https://theodouwes.com`)
2. Confirm hero brand “Theo Douwes”
3. Confirm `#work` shows Navigara
4. Confirm LinkedIn / GitHub / Medium links on `#connect`
5. Confirm `/robots.txt`, `/sitemap.xml`, `/llms.txt` return 200
6. Confirm `#skills` catalog is present (Skill Storm on desktop)
7. Open TheoAI (bottom-right launcher), ask a question, confirm a streamed markdown reply with a follow-up pill
8. Confirm `/status` (unlisted) shows `OPENROUTER_API_KEY present` and at least one model `OK`
