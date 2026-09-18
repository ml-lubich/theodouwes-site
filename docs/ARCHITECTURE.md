# Architecture

## Stack

- **Runtime / package manager:** Bun
- **Framework:** Next.js 15 App Router
- **UI:** React 19 Server Components (static page) + client motion (`framer-motion`)
- **Hosting:** Vercel

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Domain | `src/lib/profile.ts`, `src/lib/skills.ts`, `src/lib/theme.ts` | Typed profile, skills bank, theme helpers |
| Application | `src/lib/home-model.ts` | Maps profile → home page view model |
| Presentation | `src/components/*`, `src/app/*` | Layout, sections, Skill Storm, theme toggle, styles, motion |
| Crawl | `src/app/robots.ts`, `src/app/sitemap.ts`, `public/llms.txt` | Search + LLM discoverability |
| AI chat | `src/lib/ai/*`, `src/app/api/chat/route.ts`, `src/components/TheoAI*.tsx` | TheoAI: SSE chat endpoint, tool layer over `profile`/`skills`, streaming panel |

## Data flow

```
profile (domain) → buildHomePageModel() → page.tsx → section components
```

No CMS, database, or auth in v1. Content is source-controlled TypeScript.

### TheoAI (chat assistant)

```
TheoAI panel (client) → POST /api/chat (SSE)
  → rate-limit gate (lib/ai/rate-limit.ts)
  → agentic loop over the OpenRouter cascade (lib/ai/models.ts)
    → tool calls resolved by lib/ai/profile-tools.ts, reading profile/skills directly
  → SSE frames: text | tool | chart | contact | followups | error | done
→ panel renders: react-markdown+remark-gfm prose, TheoAIChart (recharts),
  TheoAIMermaid (mermaid), TheoAIContactCard
```

Same free-tier-first OpenRouter cascade, tool-call budget (last round asked
with no tools so the model must answer), per-model deadline and refusal
cooldown, and adversarial rate limiting as the reference chat implementations
this was ported from (`~/dev/portfolio`'s MLBot, `~/dev/ashveer-site`'s
AshveerAI) — adapted to this site's plain-CSS token system (no Tailwind, no
icon library) and to markdown-rendered replies. There is no booking
calendar or resume file on this site, so TheoAI has no booking/resume tools
— only a contact hand-off over the links already published in Connect and
the footer. `/status` (unlisted, noindexed, disallowed in `robots.ts`)
live-checks every model in the cascade.

## Decisions

1. **Static content module** over MDX/CMS — fastest path for a single-page portfolio.
2. **Pure model builder** — keeps integration tests free of React.
3. **CSS variables in `globals.css`** — one token system, no UI kit dependency.
4. **Framer Motion for enter/scroll motion** — parent opacity/transform; CSS `data-reveal-*` still drives timeline child choreography.
