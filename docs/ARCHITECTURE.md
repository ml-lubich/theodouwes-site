# Architecture

## Stack

- **Runtime / package manager:** Bun
- **Framework:** Next.js 15 App Router
- **UI:** React 19 Server Components (static page)
- **Hosting:** Vercel

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Domain | `src/lib/profile.ts` | Typed profile content + pure helpers |
| Application | `src/lib/home-model.ts` | Maps profile → home page view model |
| Presentation | `src/components/*`, `src/app/*` | Layout, sections, styles |

## Data flow

```
profile (domain) → buildHomePageModel() → page.tsx → section components
```

No CMS, database, or auth in v1. Content is source-controlled TypeScript.

## Decisions

1. **Static content module** over MDX/CMS — fastest path for a single-page portfolio.
2. **Pure model builder** — keeps integration tests free of React.
3. **CSS variables in `globals.css`** — one token system, no UI kit dependency.
