# Design

## Direction

**Black / white quant** — near-black field + white type in dark mode; light field + black type in light mode. Liquid/molten glass panels, Cursor/Vercel-clean chrome. Monochrome ambient orbs + grid overlay.

## Tokens

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--bg` | `#050505` | `#f4f4f2` | Page field |
| `--ink` | `#f5f5f5` | `#0a0a0a` | Primary text |
| `--ink-muted` | `#a1a1a1` | `#4a4a4a` | Supporting text |
| `--line` | white 10% | black 10% | Hairline borders |
| `--brain` | `#ffffff` | `#000000` | Wireframe brain |

Theme is set via `data-theme="dark|light"` on `<html>`, persisted in `localStorage` (`theo-theme`), with a FOUC-prevention boot script. Toggle lives in the header.

## Typography

- **Display / body:** IBM Plex Sans — quant/finance corporate face (light–medium weights)
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
