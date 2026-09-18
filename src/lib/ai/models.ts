/**
 * ─── Model cascade ─────────────────────────────────────────────────────
 *
 * Kept IDENTICAL — same slugs, same order — to the reference chat's cascade
 * (~/dev/portfolio and ~/dev/ashveer-site `app/api/chat/route.ts`). One
 * roster, vetted upstream, so a slug retirement is caught wherever it is
 * noticed first rather than only on this site.
 *
 * Free first, then a cheap paid backstop. Each entry is a different lab, so
 * one provider being down, rate-limited or retired does not take TheoAI
 * with it. The paid backstop is chosen for DURABILITY — open-weight models
 * served by many providers, so a single host withdrawing does not retire
 * the slug, which is exactly how `openai/gpt-oss-20b:free` died and took a
 * cascade down with it.
 *
 * Every entry is verified for BOTH tool calling and clean output. Models
 * that stream chain-of-thought as ordinary content leak the system prompt
 * into the panel and are excluded regardless of capability —
 * `reasoning.exclude` does not stop them.
 */
export const MODELS = [
  "inclusionai/ling-3.0-flash-vl:free",
  "cohere/north-mini-code:free",
  "nex-agi/nex-n2.5-mini:free",
  "mistralai/mistral-nemo",
  "openai/gpt-oss-20b",
  "meta-llama/llama-3.1-8b-instruct",
] as const;
