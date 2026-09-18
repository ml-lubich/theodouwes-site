/**
 * ─── TheoAI chat endpoint ───────────────────────────────────────────────
 *
 * Streams an agentic loop (model → tool calls → model → …) over OpenRouter
 * and emits SSE frames the client renders incrementally.
 *
 * Every request passes the adversarial limiter in `lib/ai/rate-limit` first;
 * this endpoint spends real money, so the limiter is the security boundary.
 *
 * Ported from the reference chat (~/dev/portfolio's MLBot and
 * ~/dev/ashveer-site's AshveerAI): the free-tier cascade and empty-final
 * recovery from the former, the per-model deadline and refusal cooldown
 * from the latter.
 */

import { NextRequest } from "next/server";
import { runTool, TOOL_SCHEMAS, SYSTEM_PROMPT } from "@/lib/ai/profile-tools";
import { checkRateLimit, clientIp, buildCookie, acquireSlot, COOKIE_NAME } from "@/lib/ai/rate-limit";
import { FollowupStream } from "@/lib/ai/followups";
import {
  emptyStreamState,
  finalizeAssistantTurn,
  formatCascadeFailure,
  ingestCompletionChunk,
  type CascadeAttempt,
} from "@/lib/ai/chat-stream";
import { MODELS } from "@/lib/ai/models";

export const runtime = "nodejs";
export const maxDuration = 60;

/* Every "it did not work" path says this one line. Which model 429'd, which
 * slug is retired, how the cascade died — goes to the server log only. A
 * visitor never sees a slug, an HTTP status, or an upstream error body: that
 * text can carry account/key-management detail, and it is meaningless to
 * someone who just wants an answer. */
const UNAVAILABLE =
  "TheoAI isn't available right now — please try again in a few minutes, or email Theo directly.";

const NOT_CONFIGURED = "Chat is not configured.";

/** How long one model gets to produce response headers before the cascade
 *  moves on. Without a ceiling a single stalled provider holds the whole
 *  stream open and the panel reads as hung; the point of a cascade is that
 *  any one member can be abandoned. */
const MODEL_TIMEOUT_MS = 6_000;

/* A model that just refused — 402/403 on a spend limit, 429 on a rate limit —
 * will refuse the next request too, so re-attempting it every time turns one
 * failure into a permanent tax on every conversation. Module scope, so it
 * lives as long as the warm instance.
 * ponytail: in-memory and per-instance, so each cold instance pays the first
 * miss again. A shared store would cost more than that miss is worth. */
const REFUSAL_COOLDOWN_MS = 60_000;
const refusingUntil = new Map<string, number>();

const LIMITS = {
  maxMessageChars: 1000,
  maxHistory: 12,
  maxToolRounds: 4,
  maxTokens: 900,
} as const;

interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export async function POST(req: NextRequest) {
  /* Shape-checked, not just present-checked. A truthy-but-malformed value —
     whitespace-only, quoted, an unsubstituted placeholder — walks past a bare
     `if (!apiKey)` and fails upstream with OpenRouter's 401 only AFTER the
     SSE stream has already answered 200, which reads as a working endpoint.
     A real key is `sk-or-...`. */
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey?.startsWith("sk-or-")) return json({ error: NOT_CONFIGURED }, 503);

  const gate = checkRateLimit(clientIp(req.headers), req.cookies.get(COOKIE_NAME)?.value);
  if (!gate.ok) {
    return json({ error: rateLimitMessage(gate.reason), retryAfter: gate.retryAfterSec }, 429, {
      "Retry-After": String(gate.retryAfterSec),
    });
  }

  // Request counts alone do not bound concurrent work: one client can hold
  // many streams open at once. Take a slot or refuse.
  const release = acquireSlot(clientIp(req.headers));
  if (!release) {
    return json({ error: "You already have a message in flight. Wait for it to finish." }, 429, {
      "Retry-After": "5",
    });
  }

  const history = parseHistory(await readJson(req));
  if (history.length === 0) {
    release();
    return json({ error: "Send a message." }, 400);
  }

  const stream = runAgent(history, apiKey, release);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "Set-Cookie": buildCookie(gate.cookie),
      "X-RateLimit-Remaining": String(gate.remaining),
    },
  });
}

/* ── Agent loop ──────────────────────────────────────────────────────── */

function runAgent(history: ChatMessage[], apiKey: string, release: () => void): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const messages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }, ...history];

      try {
        const toolPayloads: string[] = [];

        for (let round = 0; round < LIMITS.maxToolRounds; round++) {
          /* The last round is asked WITHOUT tools. A model that keeps
             reaching for another lookup burns the budget and the visitor
             gets an apology while the payloads that answered the question
             already sit in `messages`. Withholding the tools makes the
             final round produce prose, not a fifth call. */
          const lastRound = round === LIMITS.maxToolRounds - 1;
          const reply = await callModel(messages, apiKey, send, !lastRound);
          const decision = finalizeAssistantTurn(
            { content: reply.content, tool_calls: reply.tool_calls, followups: reply.followups },
            toolPayloads,
          );

          // Tools keep the loop going. A silent final after a lookup is not
          // success — write the honest one-sentence fallback instead of
          // `done` with an empty bubble.
          if (decision.kind !== "tools") {
            if (decision.kind === "fallback") send("text", decision.text);
            if (reply.followups?.length) send("followups", reply.followups);
            send("done", {});
            controller.close();
            return;
          }

          messages.push(reply);

          for (const call of reply.tool_calls ?? []) {
            const args = safeParseArgs(call.function.arguments);
            send("tool", { name: call.function.name });

            const result = runTool(call.function.name, args);
            // Charts render client-side; the model still sees the spec so it
            // knows what the user is looking at and does not narrate the bars.
            if ("chart" in result) send("chart", result.chart);
            // Same hand-off pattern: the card carries the address, so the
            // model has nothing left to paste.
            if ("contact" in result) send("contact", result.contact);

            const serialized = JSON.stringify(result).slice(0, 6000);
            toolPayloads.push(serialized);
            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: serialized,
            });
          }
        }

        // Tool budget exhausted and the tool-free round still said nothing.
        send("text", UNAVAILABLE);
        send("done", {});
        controller.close();
      } catch (err) {
        // The cascade failure names every model it tried — useful in the
        // log, meaningless (and a possible info leak) in a chat bubble.
        console.error("[chat] stream failed:", err);
        send("error", { message: UNAVAILABLE });
        controller.close();
      } finally {
        // Always give the concurrency slot back, including on error or
        // client disconnect — otherwise an IP leaks slots until restart.
        release();
      }
    },
  });
}

/** Calls the model, streaming text deltas out as they arrive; returns the assembled reply. */
async function callModel(
  messages: ChatMessage[],
  apiKey: string,
  send: (event: string, data: unknown) => void,
  withTools = true,
): Promise<ChatMessage & { followups?: string[] }> {
  const res = await fetchWithFallback(messages, apiKey, withTools);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body from the model.");

  const decoder = new TextDecoder();
  let buffer = "";
  // Strips the trailing FOLLOWUPS: line before any of it reaches the client.
  const followupFilter = new FollowupStream();
  const state = emptyStreamState();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(payload);
      } catch {
        continue;
      }

      const before = state.content;
      ingestCompletionChunk(state, parsed);
      const added = state.content.slice(before.length);
      if (added) {
        const visible = followupFilter.push(added);
        if (visible) send("text", visible);
      }
    }
  }

  const { tail, followups } = followupFilter.finish();
  if (tail) send("text", tail);

  const calls = [...state.toolCalls.values()].filter((c) => c.function.name);
  return {
    role: "assistant",
    // The model's own transcript keeps the raw text; only the user's view is filtered.
    content: state.content,
    ...(calls.length ? { tool_calls: calls } : {}),
    ...(followups.length ? { followups } : {}),
  };
}

/** Tries each model in order; a model being down, rate-limited or too slow
 *  to answer headers moves to the next. Every attempt is logged server-side
 *  via `formatCascadeFailure`-shaped detail; none of it reaches the client. */
async function fetchWithFallback(messages: ChatMessage[], apiKey: string, withTools = true): Promise<Response> {
  const attempts: CascadeAttempt[] = [];

  const now = Date.now();
  // Skip whatever is still refusing — unless that is everything, in which
  // case try them all rather than answering nothing.
  const live = MODELS.filter((m) => (refusingUntil.get(m) ?? 0) <= now);

  for (const model of live.length ? live : MODELS) {
    const attempt = fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://theodouwes.com",
        "X-Title": "TheoAI - theodouwes.com",
      },
      body: JSON.stringify({
        model,
        messages,
        ...(withTools ? { tools: TOOL_SCHEMAS, tool_choice: "auto" } : {}),
        stream: true,
        // Honoured by providers that separate reasoning tokens; models
        // that ignore it are kept out of MODELS entirely.
        reasoning: { exclude: true },
        max_tokens: LIMITS.maxTokens,
        temperature: 0.3,
      }),
    });

    /* Raced rather than passed as `signal:` — an AbortSignal on the fetch
       would also cut the body mid-answer, and the deadline is only meant to
       cover the wait for headers. A model that misses it is abandoned, not
       truncated. */
    const res = await Promise.race([
      attempt.catch((err: unknown) => ({ networkError: err }) as const),
      new Promise<{ timedOut: true }>((resolve) => setTimeout(resolve, MODEL_TIMEOUT_MS, { timedOut: true })),
    ]);

    if ("timedOut" in res) {
      attempts.push({ model, status: 0, body: `nothing within ${MODEL_TIMEOUT_MS}ms` });
      continue;
    }
    if ("networkError" in res) {
      attempts.push({ model, status: 0, body: String(res.networkError).slice(0, 200) });
      continue;
    }
    if (res.ok && res.body) return res;

    // 402/403 is a spend limit, 429 a rate limit. Both persist; a 500 may not.
    if (res.status === 402 || res.status === 403 || res.status === 429) {
      refusingUntil.set(model, Date.now() + REFUSAL_COOLDOWN_MS);
    }
    attempts.push({ model, status: res.status, body: (await res.text().catch(() => "")).slice(0, 200) });
  }

  // The message here is server-log-only — the catch block in `runAgent`
  // never forwards `err.message` to the client, only the generic UNAVAILABLE.
  throw new Error(formatCascadeFailure(attempts));
}

/* ── Input handling ──────────────────────────────────────────────────── */

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

/** Trusts nothing from the client: roles, lengths and history depth are all clamped. */
function parseHistory(body: unknown): ChatMessage[] {
  if (typeof body !== "object" || body === null) return [];
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) return [];

  const clean: ChatMessage[] = [];
  for (const m of raw.slice(-LIMITS.maxHistory)) {
    if (typeof m !== "object" || m === null) continue;
    const { role, content } = m as { role?: unknown; content?: unknown };
    // Only user/assistant turns survive — a client cannot inject a system prompt.
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    clean.push({ role, content: content.slice(0, LIMITS.maxMessageChars) });
  }
  return clean;
}

function safeParseArgs(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || "{}");
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function rateLimitMessage(reason: "burst" | "cookie" | "ip" | "global" | "replay"): string {
  if (reason === "burst") return "Slow down a moment — too many messages at once.";
  if (reason === "global") return "TheoAI is at capacity right now. Try again later.";
  if (reason === "replay") return "That session looks stale. Reload the page and try again.";
  return "You've hit the hourly message limit. Try again a bit later, or email Theo directly.";
}

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
