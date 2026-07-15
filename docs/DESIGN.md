# Design

## Direction

**Black / white quant** — near-black field, white type, liquid/molten glass panels (portfolio-inspired), Cursor/Vercel-clean chrome. Monochrome ambient orbs + grid overlay.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#050505` | Page field |
| `--ink` | `#f5f5f5` | Primary text |
| `--ink-muted` | `#a1a1a1` | Supporting text |
| `--line` | `rgba(255,255,255,0.1)` | Hairline borders |
| `--glass` | translucent white | Liquid glass surfaces |

## Typography

- **Display / body:** IBM Plex Sans — quant/finance corporate face (light–medium weights)
- **Utility:** IBM Plex Mono — labels, nav, CTAs, tenure, stats

Avoid soft decorative faces; precision over shout.

## Motion

- Large white rotating wireframe brain as **hero atmospheric backdrop** (portfolio `brain.bin`, monochrome, drag-to-rotate) — not clipped to the name
- Portrait uses high-quality `/theo.webp`
- Scroll reveal with subtle 3D tilt (`Reveal`)
- Continuous skeleton shimmer on glass cards
- Interactive hover lifts on CTAs, chips, and portrait

## Composition rules

1. First viewport is one composition: brand (hero-level), one headline, one supporting sentence, one CTA group, atmospheric full-bleed field.
2. No cards in the hero. Experience is a timeline list, not card grid.
3. Motion: hero rise-in, drifting grid, floating portrait, molten glass sheen, staggered signal chips, scroll-entry sections, scanline overlay. Respects `prefers-reduced-motion`.

## Sections

1. Hero
2. About
3. Work (+ Education)
4. Featured (press)
5. Writing
6. Footer
