# API

No public HTTP API in v1.

## Internal contracts

### `profile` (`src/lib/profile.ts`)

Typed site content: identity, about, experience, education, featured, writing, links.

### `buildHomePageModel(profile)` (`src/lib/home-model.ts`)

Pure function. Input: profile-shaped object. Output: `HomePageModel` with CTAs for the home page.

### `formatTenure(start, end)` / `getExperienceById(id)`

Pure helpers used by presentation and tests.
