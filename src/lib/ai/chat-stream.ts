/**
 * ─── OpenRouter stream ingest + empty-final recovery ──────────────────
 *
 * Ported from the reference chat's `lib/ai/chat-stream.ts`
 * (~/dev/portfolio, MLBot). Two independent failure modes that turned a
 * live HTTP 200 into a blank chat bubble there:
 *
 * 1. Some models put the answer on `choices[0].message` and never emit a
 *    `delta.content` string. Reading only deltas drops a real reply.
 * 2. Some models call tools, get the payload, and then emit nothing. A
 *    silent final after tools is not success.
 *
 * Unlike the reference, the silent-final recovery here never prints a raw
 * list of search-hit titles — that read as robotic, not helpful, and the
 * model has already been given every fact it needs to write real prose.
 * The fallback is one honest sentence instead.
 */

export interface StreamToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface StreamState {
  content: string;
  toolCalls: Map<number, StreamToolCall>;
}

export function emptyStreamState(): StreamState {
  return { content: "", toolCalls: new Map() };
}

export function ingestCompletionChunk(state: StreamState, chunk: unknown): void {
  if (typeof chunk !== "object" || chunk === null) return;
  const choice = (chunk as { choices?: unknown[] }).choices?.[0];
  if (typeof choice !== "object" || choice === null) return;

  const delta = (choice as { delta?: unknown }).delta;
  const message = (choice as { message?: unknown }).message;

  const deltaContent = readContent(field(delta, "content"));
  if (deltaContent) state.content += deltaContent;
  else if (!state.content) {
    const messageContent = readContent(field(message, "content"));
    if (messageContent) state.content = messageContent;
  }

  applyToolFragments(state, field(delta, "tool_calls"));
  if (state.toolCalls.size === 0) applyToolFragments(state, field(message, "tool_calls"));
}

function field(obj: unknown, key: string): unknown {
  if (typeof obj !== "object" || obj === null) return undefined;
  return (obj as Record<string, unknown>)[key];
}

function readContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .map((part) => {
      if (typeof part === "string") return part;
      if (typeof part === "object" && part !== null && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
      return "";
    })
    .join("");
}

function applyToolFragments(state: StreamState, raw: unknown): void {
  if (!Array.isArray(raw)) return;
  for (const frag of raw) {
    if (typeof frag !== "object" || frag === null) continue;
    const index = typeof (frag as { index?: unknown }).index === "number" ? (frag as { index: number }).index : 0;
    const existing = state.toolCalls.get(index) ?? {
      id: "",
      type: "function" as const,
      function: { name: "", arguments: "" },
    };
    const id = (frag as { id?: unknown }).id;
    if (typeof id === "string" && id) existing.id = id;
    const fn = (frag as { function?: unknown }).function;
    if (typeof fn === "object" && fn !== null) {
      const name = (fn as { name?: unknown }).name;
      const args = (fn as { arguments?: unknown }).arguments;
      if (typeof name === "string" && name) existing.function.name = name;
      if (typeof args === "string" && args) existing.function.arguments += args;
    }
    state.toolCalls.set(index, existing);
  }
}

export interface AssistantTurn {
  content: string;
  tool_calls?: StreamToolCall[];
  followups?: string[];
}

export type TurnDecision =
  | { kind: "tools" }
  | { kind: "answer"; text: string }
  | { kind: "fallback"; text: string };

/** One honest sentence, not a title dump — no fallback path here ever lists
 *  raw search-hit titles at the visitor. */
export const SILENT_FINAL_FALLBACK =
  "I looked that up but couldn't put together a clean answer. Try asking more specifically?";

/** After a model round: keep looping, accept the text, or recover from silence.
 *
 * `sawVisual` covers the chart/contact cards: the client already rendered
 * something real for the tool call that just ran, so a silent final reply is
 * not a failure to recover from — it is a model that (correctly) had nothing
 * left to say. Live 2026-09-18: "Show his skills as a chart" rendered the
 * chart, then this fallback line printed underneath it anyway. */
export function finalizeAssistantTurn(
  reply: AssistantTurn,
  toolPayloads: string[],
  sawVisual = false,
): TurnDecision {
  if (reply.tool_calls?.length) return { kind: "tools" };
  const text = reply.content.trim();
  if (text) return { kind: "answer", text: reply.content };
  if (sawVisual) return { kind: "answer", text: "" };
  if (toolPayloads.length) return { kind: "fallback", text: SILENT_FINAL_FALLBACK };
  return { kind: "answer", text: "" };
}

export interface CascadeAttempt {
  model: string;
  status: number;
  body: string;
}

export function formatCascadeFailure(attempts: CascadeAttempt[]): string {
  if (!attempts.length) return "No model responded.";
  return attempts.map((a) => `${a.model}: ${a.status} ${a.body.slice(0, 200)}`).join(" | ");
}
