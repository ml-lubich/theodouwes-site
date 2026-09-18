# Testing

## Strategy

| Layer | Tool | Location | What it proves |
| --- | --- | --- | --- |
| Unit | `bun:test` | `src/lib/*.test.ts` | Domain helpers, brain.bin parser, profile invariants |
| Component | `bun:test` + Testing Library | `src/components/*.test.tsx` | UI sections, reveal, hero, brain stage |
| Integration | `bun:test` | `src/__tests__/integration/` | Home model wiring, page composition, app routes |
| E2E | Playwright | `e2e/` | Rendered page: hero, brain, sections, Navigara, documented stats, desktop nav + mobile hamburger, Connect links, robots/sitemap/llms, dark/light theme toggle |
| E2E links | Playwright | `e2e/links.spec.ts` | Dynamic BFS exploration of same-origin pages + outbound/asset/anchor checks; fail on 404/410/5xx |

### TheoAI (chat)

| Layer | Location | What it proves |
| --- | --- | --- |
| Unit | `src/lib/ai/chat-stream.test.ts` | OpenRouter delta/message-content ingestion, tool-call stitching, the empty-final fallback never lists raw search-hit titles |
| Unit | `src/lib/ai/chat-segments.test.ts` | Mermaid-fence extraction, chart-tool-spec de-duplication, streaming-safe unclosed-fence handling |
| Unit | `src/lib/ai/followups.test.ts` | `label :: question` follow-up pair parsing/clamping/dedup |
| Unit | `src/lib/ai/profile-tools.test.ts` | Tools are grounded in real profile/skills data, `get_contact` matches the published address, `stripCardLinks`, tool-label coverage, system-prompt guards |
| Unit | `src/lib/ai/status-check.test.ts` | Model status checks (mocked `fetch`) and `publicError()` stripping key-management URLs from a public page |
| Integration | `src/__tests__/integration/chat-route.test.ts` | `/api/chat`'s tool-round budget (last round gets no tools), the 503-when-unconfigured contract, and that a cascade failure never leaks per-model detail to the client |
| Component | `src/components/TheoAI.test.tsx` | A streamed markdown reply renders as real markup (no raw `**`/bullets), a `chart` SSE frame mounts a chart, tool/contact/follow-up affordances render, stop aborts the stream, new chat clears the transcript |

Network-hitting cases in the integration suite are skipped when
`process.env.VERCEL` is set, matching the reference chat's convention —
they stub `fetch` and exercise request/response wiring, not a live call.

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
