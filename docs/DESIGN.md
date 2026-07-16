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

- White rotating wireframe brain beneath the hero name (`brain.bin`, monochrome, drag-to-rotate)
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

## Sections

1. Hero
2. About (+ documented stats + skills)
3. Work (+ Education)
4. Projects
5. Writing
6. Footer (email, phone, LinkedIn, GitHub, Medium, ZeroCopy demo, Navigara)
