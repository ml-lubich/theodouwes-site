# API

## `POST /api/chat` — TheoAI

Server-Sent Events endpoint backing the TheoAI chat panel. Streams an
agentic loop over the OpenRouter free-tier-first model cascade
(`src/lib/ai/models.ts`, kept identical to the reference chat's cascade),
with tools resolved by `src/lib/ai/profile-tools.ts` against `profile`/
`skills` only — never invented facts.

**Request:** `{ messages: { role: "user" | "assistant"; content: string }[] }`
(server clamps to the last 12 turns, 1000 chars each).

**Response:** `text/event-stream`. Frames:

| Event | Payload | Meaning |
| --- | --- | --- |
| `text` | string | A token delta of the assistant's markdown reply |
| `tool` | `{ name }` | A profile-tools lookup started |
| `chart` | `ChartSpec` | Bar/line chart spec for `TheoAIChart` (recharts) |
| `contact` | `ContactSpec` | Contact hand-off card data (email/phone/LinkedIn/GitHub — no booking or resume) |
| `followups` | `string[]` | Model-suggested next questions (`label :: question` pairs) |
| `error` | `{ message }` | A generic, safe-to-display failure — never a model slug, HTTP status, or upstream body |
| `done` | `{}` | Turn complete |

**Env vars (both already set on the Vercel project):**

- `OPENROUTER_API_KEY` — missing or malformed (must start `sk-or-`) → `503 { "error": "Chat is not configured." }`
- `CHAT_RATE_SECRET` — HMAC key signing the rate-limit cookie (`theoai_q`); falls back to `OPENROUTER_API_KEY` then a dev-only default if unset.

**Guarantees:**

- Tool-call budget: at most 4 rounds; the last round is offered no tools, so the model must answer from what it already looked up rather than looping.
- Per-model deadline (6s to first response headers) and a 60s refusal cooldown per model after a 402/403/429, so one stalled or rate-limited provider does not hold the whole cascade hostage.
- Cascade failures are logged server-side only (`console.error`); the client only ever receives one generic, contact-hinting sentence — never a slug, status, or upstream error body (upstream bodies can carry account/key-management URLs).
- Adversarial rate limiting (`src/lib/ai/rate-limit.ts`): signed cookie quota + per-IP floor + burst guard + global daily cap + per-IP concurrency cap.

## `GET /status` — TheoAI diagnostics

Unlisted page (no nav/footer/sitemap entry, `noindex`, disallowed in
`robots.ts`, revalidates once a day). Live-checks every model in the
cascade and reports latency/ok/error per model. Error text goes through
`publicError()` (`src/lib/ai/status-check.ts`), which keeps only
OpenRouter's `error.message` and strips anything from the first URL
onward — the page is public, and a 403 body can otherwise carry a
key-management URL.

## Internal contracts

### `profile` (`src/lib/profile.ts`)

Typed site content: identity, about, experience, education, projects, writing, links (including email, phone, ZeroCopy demo). `skills` is derived from `flattenSkills()`.

### `skills` (`src/lib/skills.ts`)

Categorized honest keyword bank + `flattenSkills()` / `getSkillCategory()` for Skill Storm, SEO catalog, and JSON-LD `knowsAbout`.

### `buildHomePageModel(profile)` (`src/lib/home-model.ts`)

Pure function. Input: profile-shaped object. Output: `HomePageModel` with CTAs, skill categories, and social URLs for the home page.

### `theme` (`src/lib/theme.ts`)

Pure helpers: `resolveInitialTheme`, `toggleTheme`, `brainColorForTheme`, `THEME_STORAGE_KEY`.

### `ThemeProvider` / `ThemeToggle`

Client theme context sets `data-theme` on `<html>`, persists choice, and drives brain wireframe color (white dark / black light).

### Crawl / LLM surfaces

- `src/app/robots.ts` → `/robots.txt` (allow all + major AI crawlers; sitemap pointer)
- `src/app/sitemap.ts` → `/sitemap.xml`
- `public/llms.txt` → plain-text fact sheet for LLM scrapers
- Person JSON-LD in `src/app/layout.tsx`

### `formatTenure(start, end)` / `getExperienceById(id)`

Pure helpers used by presentation and tests.

### Content honesty

`profile` + `skills` are the source of truth for published facts. Do not invent occupancy %, Mag 7 revenue, model lift, or closed-deal claims in UI copy.
