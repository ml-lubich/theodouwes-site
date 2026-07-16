# API

No public HTTP API in v1.

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
