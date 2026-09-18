/**
 * ─── Follow-up extraction ─────────────────────────────────────────────
 *
 * The model appends its suggested follow-up questions to the SAME reply,
 * on a final `FOLLOWUPS: a | b | c` line. Generating them with a second
 * model call would double both the cost per turn and the abuse surface,
 * so we take them for free out of the response we were already paying for.
 *
 * The catch is streaming: the marker must never reach the user's screen.
 * This filter holds back a tail just long enough to recognise a marker
 * that arrives split across delta boundaries ("FOLLOW" + "UPS:").
 */

export const FOLLOWUP_MARKER = "FOLLOWUPS:";

/** `max` is a hard cap on the count; `maxChars` only shortens the pill label
 *  (see `clampFollowup`) — the full question is still what gets sent. */
export const FOLLOWUP_LIMITS = {
  max: 3,
  maxChars: 52,
} as const;

export class FollowupStream {
  private buf = "";
  private emitted = 0;

  /** Returns the slice of text that is safe to show the user right now. */
  push(delta: string): string {
    this.buf += delta;
    const idx = this.buf.indexOf(FOLLOWUP_MARKER);
    // Once the marker is seen, nothing after it is ever user-visible.
    // Until then, withhold the last few chars in case they begin one.
    const safeEnd = idx >= 0 ? idx : Math.max(0, this.buf.length - (FOLLOWUP_MARKER.length - 1));
    if (safeEnd <= this.emitted) return "";
    const out = this.buf.slice(this.emitted, safeEnd);
    this.emitted = safeEnd;
    return out;
  }

  /** Flushes any withheld text and parses the follow-ups. */
  finish(): { tail: string; followups: string[] } {
    const idx = this.buf.indexOf(FOLLOWUP_MARKER);

    if (idx < 0) {
      const tail = this.buf.slice(this.emitted);
      this.emitted = this.buf.length;
      return { tail, followups: [] };
    }

    const tail = this.emitted < idx ? this.buf.slice(this.emitted, idx) : "";
    this.emitted = idx;
    return { tail, followups: parseFollowups(this.buf.slice(idx + FOLLOWUP_MARKER.length)) };
  }
}

/** A follow-up is a pair: what the pill says, and what tapping it asks.
 *  The wire stays a plain string — `Short label :: Full question?` — so a
 *  server that has not been taught the pair form still works. */
export interface Followup {
  label: string;
  question: string;
}

/** Separates the pill label from the question inside one follow-up string.
 *  Only the FIRST `::` separates; a question is allowed to contain a colon. */
const FOLLOWUP_SPLIT = /\s*::\s*/;

/** Splits `label :: question`. With no separator — or with one side empty —
 *  the whole thing is both, which is exactly the old plain-string behaviour. */
export function splitFollowup(raw: string): Followup {
  const [head, ...rest] = raw.split(FOLLOWUP_SPLIT);
  const label = head.trim();
  const question = rest.join(" :: ").trim();
  if (!label) return { label: question, question };
  if (!question) return { label, question: label };
  return { label, question };
}

/** Display-only: shortens a pill LABEL to `maxChars` without splitting a
 *  word. The question itself is never clamped — what the model wrote is what
 *  gets sent when the pill is tapped. */
export function clampFollowup(s: string): string {
  if (s.length <= FOLLOWUP_LIMITS.maxChars) return s;
  const cut = s.slice(0, FOLLOWUP_LIMITS.maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

/** Splits, trims and dedupes the raw follow-up line. Never trusts the model's
 *  count — but does keep each question whole. */
export function parseFollowups(raw: string): string[] {
  const seen = new Set<string>();

  return raw
    .split("|")
    .map((s) => s.replace(/\s+/g, " ").trim())
    // Strip any list numbering the model adds despite the format instruction.
    .map((s) => s.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    // Models repeat themselves; two identical pills read as a rendering bug.
    .filter((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, FOLLOWUP_LIMITS.max);
}
