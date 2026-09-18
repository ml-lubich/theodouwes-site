/**
 * ─── Card link stripping ──────────────────────────────────────────────
 *
 * The contact card already carries the real email and LinkedIn profile.
 * The prompt tells the model not to repeat them; models repeat them anyway,
 * and a pasted address renders as raw text directly under a card that
 * already says the same thing.
 *
 * So strip them on display. The prompt is guidance; this is the guarantee.
 */

import { CONTACT_EMAIL, LINKEDIN_URL } from "./profile-tools";

const TARGETS = [`mailto:${CONTACT_EMAIL}`, CONTACT_EMAIL, LINKEDIN_URL];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function stripCardLinks(text: string): string {
  let out = text;
  for (const target of TARGETS) {
    const t = escape(target);
    out = out
      // [label](target…) → label, so the sentence keeps its wording. An
      // email whose label is the address itself falls through to the
      // bare pass below and goes with it.
      .replace(new RegExp(`\\[([^\\]]*)\\]\\(\\s*${t}[^)]*\\)`, "gi"), "$1")
      // A lead-in separator goes with the thing it introduced, so
      // "reach him — <address>." does not become "reach him — .".
      .replace(new RegExp(`([ \\t]*[—–:-][ \\t]*)?<${t}[^>]*>`, "gi"), "")
      .replace(new RegExp(`([ \\t]*[—–:-][ \\t]*)?${t}`, "gi"), "");
  }

  return out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
