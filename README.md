# Theo Douwes Site

Personal website for **Theo Alexander Douwes** — UC Berkeley Statistics graduate building GTM systems, underwriting tools, and probabilistic decision software. GTM and Sales Engineer at Navigara.

## Stack

- Next.js 15 (App Router) + React 19
- Framer Motion
- Bun
- Playwright (e2e)
- Bun test (unit + integration)
- Deployed on Vercel

## Local development

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
bun test                 # unit + integration
bun run build && bun run test:e2e   # Playwright (needs a production build)
bun run test:all         # unit/integration then e2e (build first for e2e)
```

## Deploy

```bash
bun run build
vercel --prod
```

## Docs

See `docs/` for architecture, design, requirements, testing, and deployment.
