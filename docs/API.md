# API

No public HTTP API in v1.

## Internal contracts

### `profile` (`src/lib/profile.ts`)

Typed site content: identity, about, experience, education, projects, writing, links (including email, phone, ZeroCopy demo).

### `buildHomePageModel(profile)` (`src/lib/home-model.ts`)

Pure function. Input: profile-shaped object. Output: `HomePageModel` with CTAs for the home page.

### `formatTenure(start, end)` / `getExperienceById(id)`

Pure helpers used by presentation and tests.

### Content honesty

`profile` is the single source of truth for published facts. Do not invent occupancy %, Mag 7 revenue, model lift, or closed-deal claims in UI copy.
