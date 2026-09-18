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
 * Models also print the chart TOOL's own spec as prose once it already
 * arrived over the `chart` SSE event — either the bare `ChartSpec`
 * (`{"kind":"bar",…}`) or, more often, the whole tool-result payload it was
 * handed back in context (`{"chart":{"kind":"bar",…}}`, sometimes wrapped in
 * an array: `[{"chart":{...}}]`). Both are a duplicate of what already
 * rendered — drop them rather than showing raw JSON.
 */

import { isMermaidDsl } from "@/lib/ai/mermaid-dsl";

export type ChatSegment = { kind: "text"; value: string } | { kind: "mermaid"; source: string };

/** Any fenced block. The label is a hint the model gets wrong (```json is
 *  common), so the payload decides whether it is a diagram. */
const FENCE = /```([a-z]*)\s*\n([\s\S]*?)```/gi;

/** The shapes the `chart` event already rendered — printing them duplicates. */
const TOOL_CHART_KINDS = new Set(["bar", "line", "radar"]);

/** A JSON object opening at the start of a line — bare (`{"kind"...`) or
 *  array-wrapped (`[{"chart"...`) — e.g. a spec the model typed out as prose.
 *  JSON objects always open with a quoted key, so `{"` anchors this without
 *  matching ordinary prose brackets (a markdown link, a footnote ref). */
const BARE_JSON = /(?:^|\n)[ \t]*(\[[ \t]*)?\{"/g;

type Verdict = "mermaid" | "drop" | "text";

/** True for anything shaped like the chart tool's output: the bare
 *  `ChartSpec` (`{"kind":"bar",…}`), the full tool-result wrapper
 *  (`{"chart":{...}}`), or either inside an array. */
function isChartToolPayload(value: unknown): boolean {
  const obj = Array.isArray(value) ? value[0] : value;
  if (typeof obj !== "object" || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  if ("chart" in rec) return true;
  if (typeof rec.kind === "string" && TOOL_CHART_KINDS.has(rec.kind)) return true;
  return Array.isArray(rec.data);
}

function classifyJson(json: string): Verdict {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return isMermaidDsl(json) ? "mermaid" : "text";
  }
  return isChartToolPayload(parsed) ? "drop" : "text";
}

function classifyFence(_lang: string, body: string): Verdict {
  const trimmed = body.trim();
  const jsonVerdict = classifyJson(trimmed);
  if (jsonVerdict === "drop") return jsonVerdict;
  if (isMermaidDsl(trimmed)) return "mermaid";
  return "text";
}

/** Index just past the JSON value (object or array) opening at `start`, or
 *  -1 while it is still streaming. `{`/`[` and `}`/`]` share one depth
 *  counter — valid JSON always nests them in matching pairs, so this closes
 *  on whichever bracket brings the count back to zero. Skips brackets
 *  inside strings. */
function endOfJsonValue(s: string, start: number): number {
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
    else if (c === "{" || c === "[") depth++;
    else if ((c === "}" || c === "]") && --depth === 0) return i + 1;
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

/** Prose, minus any bare chart-tool payload hiding in it. */
function pushProse(out: ChatSegment[], raw: string) {
  let cursor = 0;
  BARE_JSON.lastIndex = 0;

  for (let m = BARE_JSON.exec(raw); m; m = BARE_JSON.exec(raw)) {
    // `start` is the opening `[` when the match captured one, else the `{`.
    const start = m[1] ? m.index + m[0].indexOf("[") : m.index + m[0].length - 2;
    const end = endOfJsonValue(raw, start);

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
    BARE_JSON.lastIndex = end;
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
