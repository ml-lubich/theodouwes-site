/**
 * Splits a TheoAI reply into prose and mermaid-diagram segments.
 *
 * The model draws a process or timeline as native Mermaid DSL in a
 * ```mermaid fence (graph TD, flowchart LR, …). This site has no
 * JSON-diagram renderer, so mermaid is the one diagram path.
 *
 * The panel streams tokens, so a fence is routinely half-written — an
 * unclosed fence is withheld until its closing backticks arrive rather than
 * shown raw.
 *
 * Models also print the chart TOOL's own spec (`{"kind":"bar",…}`) as prose
 * once it already arrived over the `chart` SSE event. That is a duplicate —
 * drop it rather than showing it twice.
 */

import { isMermaidDsl } from "@/lib/ai/mermaid-dsl";

export type ChatSegment = { kind: "text"; value: string } | { kind: "mermaid"; source: string };

/** Any fenced block. The label is a hint the model gets wrong (```json is
 *  common), so the payload decides whether it is a diagram. */
const FENCE = /```([a-z]*)\s*\n([\s\S]*?)```/gi;

/** The shapes the `chart` event already rendered — printing them duplicates. */
const TOOL_CHART_KINDS = new Set(["bar", "line", "radar"]);

/** A JSON object opening at the start of a line, e.g. a spec the model typed
 *  out as prose. */
const BARE_OBJECT = /(?:^|\n)[ \t]*\{"/g;

type Verdict = "mermaid" | "drop" | "text";

function classifyJson(json: string): Verdict {
  let kind: unknown;
  try {
    kind = (JSON.parse(json) as { kind?: unknown }).kind;
  } catch {
    return isMermaidDsl(json) ? "mermaid" : "text";
  }
  if (typeof kind === "string" && TOOL_CHART_KINDS.has(kind)) return "drop";
  return "text";
}

function classifyFence(_lang: string, body: string): Verdict {
  const trimmed = body.trim();
  const jsonVerdict = classifyJson(trimmed);
  if (jsonVerdict === "drop") return jsonVerdict;
  if (isMermaidDsl(trimmed)) return "mermaid";
  return "text";
}

/** Index just past the object opening at `start`, or -1 while it is still
 *  streaming. Brace counting skips braces inside strings. */
function endOfObject(s: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
  }
  return -1;
}

function pushText(out: ChatSegment[], raw: string) {
  const value = raw.trim();
  if (value) out.push({ kind: "text", value });
}

function pushSegment(out: ChatSegment[], verdict: Verdict, payload: string, fence?: string) {
  if (verdict === "mermaid") out.push({ kind: "mermaid", source: payload });
  else if (verdict === "text" && fence) pushText(out, fence);
}

/** Prose, minus any bare chart-tool object hiding in it. */
function pushProse(out: ChatSegment[], raw: string) {
  let cursor = 0;
  BARE_OBJECT.lastIndex = 0;

  for (let m = BARE_OBJECT.exec(raw); m; m = BARE_OBJECT.exec(raw)) {
    const start = m.index + m[0].length - 2; // the `{` itself
    const end = endOfObject(raw, start);

    // Unterminated: the model is still typing it. Withhold the rest.
    if (end === -1) {
      pushText(out, raw.slice(cursor, start));
      return;
    }

    const verdict = classifyJson(raw.slice(start, end));
    if (verdict === "drop") {
      pushText(out, raw.slice(cursor, start));
      cursor = end;
    }
    BARE_OBJECT.lastIndex = end;
  }

  pushText(out, raw.slice(cursor));
}

export function splitChatSegments(content: string): ChatSegment[] {
  const out: ChatSegment[] = [];
  let cursor = 0;

  for (const match of content.matchAll(FENCE)) {
    const lang = (match[1] ?? "").toLowerCase();
    const body = match[2].trim();
    pushProse(out, content.slice(cursor, match.index));
    const verdict = classifyFence(lang, body);
    pushSegment(out, verdict, body, match[0]);
    cursor = match.index + match[0].length;
  }

  const tail = content.slice(cursor);
  // An opening fence with no closer is still streaming — drop the partial.
  const open = tail.search(/```/);
  pushProse(out, open === -1 ? tail : tail.slice(0, open));

  return out;
}
