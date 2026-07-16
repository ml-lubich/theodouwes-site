# Testing

## Strategy

| Layer | Tool | Location | What it proves |
| --- | --- | --- | --- |
| Unit | `bun:test` | `src/lib/*.test.ts` | Domain helpers, brain.bin parser, profile invariants |
| Component | `bun:test` + Testing Library | `src/components/*.test.tsx` | UI sections, reveal, hero, brain stage |
| Integration | `bun:test` | `src/__tests__/integration/` | Home model wiring, page composition, app routes |
| E2E | Playwright | `e2e/` | Rendered page: hero, brain, sections, Navigara, documented stats, nav |
| E2E links | Playwright | `e2e/links.spec.ts` | Dynamic BFS exploration of same-origin pages + outbound/asset/anchor checks; fail on 404/410/5xx |

## Coverage

Target: **80–90%** line/function/statement coverage on `src/` (enforced via `bunfig.toml` `coverageThreshold`).

```bash
bun test ./src --coverage
# or
bun run test:coverage
```

## Commands

```bash
bun test                 # unit + component + integration with coverage
bun run test:unit
bun run test:integration
bun run build && bun run test:e2e
```

## Definition of done

1. Feature tests for profile/model and key UI paths pass.
2. Coverage ≥ 80% (aim 80–90%).
3. Smoke: home page loads with brand + Navigara experience + brain stage.
4. Playwright dead-link audit: no 404/5xx on page links or static assets.
5. `bun run build` succeeds before production deploy.
