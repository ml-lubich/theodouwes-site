# Design

## Direction

**editorial-v1** — editorial restraint with a quant spine: Source Serif 4 display over IBM Plex Sans/Mono, one teal accent, hairline borders, flat opaque cards, no glows or heavy shadows. The ambient orbs, grid overlay, scanline, shimmer and math glyphs stay, but only as faint, static texture. See "editorial-v1 system" below (supersedes the earlier black/white glass direction where they differ).

## Tokens

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--bg` | `#0b0d10` | `#f6f6f3` | Page field |
| `--bg-elevated` | `#12151a` | `#ffffff` | Opaque card surface |
| `--ink` | `#eceef1` | `#0d1117` | Primary text |
| `--ink-muted` | `#a7aeb8` | `#424a56` | Supporting text |
| `--ink-dim` | `#8d95a1` | `#596270` | Labels, ordinals (AA on `--bg` and `--bg-elevated`) |
| `--accent` | `#6cc9bb` | `#0b6b61` | Section labels, focus ring, icon glyphs, hover |
| `--line` | white 10% | ink 12% | Hairline borders |
| `--brain` | `#ffffff` | `#000000` | Wireframe brain |

Theme is a System / Light / Dark preference (`lib/theme.ts`, pure and tested). An inline script in `<head>` (`themeBootScript`) sets `data-theme` and `color-scheme` before paint; `<meta name="color-scheme" content="light dark">` is emitted via the viewport export. The header control is a three-button group (`aria-pressed` states the current choice); a stored choice lives in `localStorage` (`theo-theme`, try/catch), `System` clears it and tracks OS changes live.

## Typography

- **Display:** Source Serif 4 (400–600, `--font-display`) — name, section titles, stats, card titles
- **Body:** IBM Plex Sans (400–600)
- **Utility:** IBM Plex Mono — labels, nav, CTAs, tenure, stats

Avoid soft decorative faces; precision over shout.

## Motion

- Rotating wireframe brain beneath the hero name (`brain.bin`, monochrome, drag-to-rotate) — **white in dark mode, black in light mode**
- Portrait uses high-quality `/theo.webp`
- Framer Motion: staggered hero fade/rise, floating portrait, scroll `Reveal` with optional 3D tilt
- Experience-specific line icons, luminous rail, animated highlights, and responsive hover tilt
- Continuous skeleton shimmer on glass cards
- Interactive hover lifts on CTAs, chips, and portrait
- Respects `prefers-reduced-motion`
- **Scroll-craft (non-hero sections only; one device each):** About = stats drift at different depths (`translate`, `--p`); Experience = a progress rail fills down the timeline (`--rail`); Projects = pinned stacking cards (scroll-stack: sticky under the header, covered cards scale 0.95 and recede under a themed shade, opaque faces; see the editorial-v1 scroll-stack rules); Writing = each card scrubbed in by its own scroll position. The hero, header, and Skills storm are untouched.
- **Gating:** all scroll-craft runs only when `useScrollCraft()` is true: width > 1366, fine pointer, no reduced motion, not touch-primary, more than 4 cores (`lib/scroll-stack-layout.ts`). SSR and compact/touch/reduced-motion render byte-identical markup to before; effects switch on after mount. Effects use `translate`/`opacity`/`transform` only, so no layout shift. A focused stack card surfaces undimmed above its siblings for keyboard users.

## Composition rules

1. First viewport is one composition: brand (hero-level), one headline, one supporting sentence, one CTA group, atmospheric full-bleed field.
2. No cards in the hero. Experience is a timeline list, not card grid.
3. Stats strip uses only documented ledger metrics ($5.88M, $350K+, 400+, 200K+).

## Navigation

- Desktop (≥721px): glass pill shell with horizontal mono links (About / Work / Projects / Writing).
- Mobile (≤720px): same glass shell; links collapse behind a circular hamburger that morphs to an X; open state expands into a short vertical link stack inside the shell (no full-screen drawer).
- Menu closes on link tap, brand tap, Escape, or resize to desktop.

## Sections

1. Hero
2. About (+ documented stats)
3. Skills — desktop Skill Storm (CSS 3D carousel ported from portfolio) + always-on categorized catalog for SEO/a11y
4. Work (+ Education)
5. Projects
6. Writing
7. Connect (LinkedIn, GitHub, Medium, ZeroCopy, Navigara, email, phone)
8. Footer (same outbound links)

## TheoAI

- Launcher: fixed bottom-right pill (`.theoai-launcher`), 1.25rem gutter, monospace label matching the nav's utility face — no icon library, no accent color.
- Panel: full-screen on mobile (`inset: 0`), a bottom-right card ≥640px (`.theoai-panel`), same border/radius/shadow language as `.glass-card`.
- Every color reads off the site's own tokens (`--ink`, `--ink-muted`, `--line`, `--bg-elevated`) so the panel repaints across the dark/light toggle with no JS — monochrome, consistent with "no portfolio purple/primary accents."
- Replies render as GitHub-flavored markdown (`react-markdown` + `remark-gfm`); charts use `recharts` in `--ink`/`--ink-muted`/`--line` only; process/architecture diagrams render as native Mermaid DSL, themed dark/neutral off `data-theme`.
- Respects `prefers-reduced-motion` (launcher pip pulse, panel-in, thinking-verb fade all disabled).

## Skill Storm

- Desktop (≥900px): orbiting opaque glass pills; drag to spin; hover pauses idle drift; respects `prefers-reduced-motion`
- Mobile: storm hidden; categorized skill lists remain fully readable
- Tokens: Theo `--ink` / glass borders (no portfolio purple/primary accents)

## editorial-v1 system

- Build markers: `<meta name="site-design" content="editorial-v1">` and `<meta name="generator-build">` (`VERCEL_GIT_COMMIT_SHA` short, else local `git rev-parse --short HEAD`, else `dev`), set in `app/layout.tsx` metadata.
- Cards (`.glass-card`) are opaque `--bg-elevated` with a 1px hairline; hover only recolors the border to `--accent`. Radius 0.5rem. No box-shadows on cards, portrait or launcher.
- Icon badges are hairline rounded squares with an accent glyph (were inverted solid discs).
- Hero portrait caption sits on a solid dark strip so it is AA over any part of the photo. The wireframe brain is a faint backdrop (opacity 0.32 dark / 0.22 light) so hero copy over it stays above AA.
- Contrast: all text is AA in both themes (scan against the painted background; text over the photo pixel-sampled). Decorative `aria-hidden` ambient glyphs are exempt.
- The TheoAI launcher is hidden at <=720px while the hero reaches the bottom-right corner, so it never covers hero copy or CTAs; it reappears after the hero.
- Entrance reveals trigger on any visible pixel (`amount: "some"`); a tall section at 360px never intersected 12% of its height and stayed at opacity 0.

### Scroll-stack rules (Projects)

- Cards stay in normal flow, 24px apart. Each is `position: sticky` under the header (`top = 112 + i*18`) and the next card rises over it. There is no runway padding or min-height, so there is no dead space after the last card; the section keeps the normal 72px bottom padding.
- Hard rule: the gap between consecutive stacked cards is <= 48px at every scroll position at 1440. Measured: 24px between cards in flow, max 33px between scaled faces.
- A covered card scales to 0.95 and receives a `--bg` shade overlay (not a brightness filter), driven by the NEXT card's scroll position (`useScroll` on the next `<li>`, from entering the viewport to its pin).
- Routing (`lib/scroll-stack-layout.ts`): column fallback at <=1366px, coarse pointer, touch, reduced motion, <=4 cores; compact markup is a plain `<ul class="link-grid">` (frozen by the SSR fixture tests). In the 2-column grid an odd last item spans both columns (no orphan).
