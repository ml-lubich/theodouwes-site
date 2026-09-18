import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  emptyStreamState,
  finalizeAssistantTurn,
  formatCascadeFailure,
  ingestCompletionChunk,
  SILENT_FINAL_FALLBACK,
} from "./chat-stream";

/**
 * Ported from ~/dev/portfolio's __tests__/ai-chat-stream.test.ts, which pins
 * three ways an OpenRouter stream turns a real HTTP 200 into a blank chat
 * bubble: a model that only writes `choices[0].message` (never `delta`), a
 * model that returns empty after tools, and a cascade that reports only the
 * last error. TheoAI's silent-final recovery deliberately differs from the
 * reference: it never lists raw search-hit titles at the visitor.
 */

describe("OpenRouter stream ingest", () => {
  test("still stitches fragmented delta tool calls", () => {
    const state = emptyStreamState();
    ingestCompletionChunk(state, {
      choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "search_profile", arguments: "" } }] } }],
    });
    ingestCompletionChunk(state, {
      choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '{"query":"underwriting"}' } }] } }],
    });
    const calls = [...state.toolCalls.values()];
    expect(calls).toHaveLength(1);
    expect(calls[0].function.name).toBe("search_profile");
    expect(calls[0].function.arguments).toBe('{"query":"underwriting"}');
  });

  test("reads text from a final message.content when no delta ever arrived", () => {
    const state = emptyStreamState();
    ingestCompletionChunk(state, { choices: [{ delta: { role: "assistant", content: null } }] });
    ingestCompletionChunk(state, {
      choices: [
        {
          delta: {},
          message: { role: "assistant", content: "He structured $5.88M in multifamily acquisitions." },
          finish_reason: "stop",
        },
      ],
    });
    expect(state.content).toBe("He structured $5.88M in multifamily acquisitions.");
  });

  test("joins array-shaped content parts", () => {
    const state = emptyStreamState();
    ingestCompletionChunk(state, {
      choices: [{ delta: { content: [{ type: "text", text: "Navigara " }, { type: "text", text: "is GTM." }] } }],
    });
    expect(state.content).toBe("Navigara is GTM.");
  });
});

describe("empty reply after tools", () => {
  test("does not treat a silent final as success once tools already ran", () => {
    const decision = finalizeAssistantTurn(
      { content: "", tool_calls: [], followups: [] },
      ['{"projects":[{"name":"GTM Outreach Operating System"}]}'],
    );
    expect(decision.kind).toBe("fallback");
    if (decision.kind === "fallback") expect(decision.text).toBe(SILENT_FINAL_FALLBACK);
  });

  test("never lists raw search-hit titles as the fallback answer", () => {
    const decision = finalizeAssistantTurn(
      { content: "", tool_calls: [] },
      ['{"matches":[{"kind":"project","name":"ZeroCopy.systems Prediction Market Pricing"}]}'],
    );
    if (decision.kind !== "fallback") throw new Error("expected a fallback decision");
    expect(decision.text).not.toContain("ZeroCopy");
    expect(decision.text).not.toMatch(/•|^- /m);
  });

  test("keeps going when the model still wants tools", () => {
    const decision = finalizeAssistantTurn(
      { content: "", tool_calls: [{ id: "1", type: "function", function: { name: "get_projects", arguments: "{}" } }] },
      [],
    );
    expect(decision.kind).toBe("tools");
  });

  test("uses the model's own text when it actually wrote some", () => {
    const decision = finalizeAssistantTurn(
      { content: "He built the GTM outreach system at Navigara.", tool_calls: [], followups: [] },
      ['{"projects":[{"name":"ignored"}]}'],
    );
    expect(decision.kind).toBe("answer");
    if (decision.kind === "answer") expect(decision.text).toMatch(/Navigara/);
  });

  // Live 2026-09-18: "Show his skills as a chart" rendered the bar chart,
  // then printed SILENT_FINAL_FALLBACK underneath it anyway — the chart
  // already answered the question, so a silent final is not a failure.
  test("a silent final after a chart or contact card is not a failure to recover from", () => {
    const decision = finalizeAssistantTurn(
      { content: "", tool_calls: [], followups: [] },
      ['{"chart":{"kind":"bar","title":"Skills by category"}}'],
      /* sawVisual */ true,
    );
    expect(decision.kind).toBe("answer");
    if (decision.kind === "answer") expect(decision.text).toBe("");
  });
});

describe("route wiring", () => {
  test("the chat endpoint uses the empty-final recovery, not a bare done", () => {
    const route = readFileSync(resolve(import.meta.dir, "../../app/api/chat/route.ts"), "utf8");
    expect(route).toContain("finalizeAssistantTurn");
    expect(route).toContain("formatCascadeFailure");
    expect(route).toContain("ingestCompletionChunk");
    expect(route).not.toMatch(/let lastError/);
  });

  test("never forwards raw per-model failure text to the client on a cascade failure", () => {
    const route = readFileSync(resolve(import.meta.dir, "../../app/api/chat/route.ts"), "utf8");
    // The catch block must send the generic UNAVAILABLE constant, never `err.message`.
    const catchBlock = route.slice(route.indexOf("} catch (err) {"), route.indexOf("} finally {"));
    expect(catchBlock).toContain('send("error", { message: UNAVAILABLE })');
    expect(catchBlock).not.toMatch(/err\.message/);
    expect(catchBlock).not.toMatch(/String\(err\)/);
  });
});

describe("cascade errors", () => {
  test("names every failed attempt, not only the last (server-log-only)", () => {
    const message = formatCascadeFailure([
      { model: "inclusionai/ling-3.0-flash-vl:free", status: 429, body: "rate limited" },
      { model: "openai/gpt-oss-20b", status: 403, body: "Key limit exceeded" },
    ]);
    expect(message).toMatch(/ling-3.0-flash-vl:free/);
    expect(message).toMatch(/429/);
    expect(message).toMatch(/gpt-oss-20b/);
    expect(message).toMatch(/403/);
  });
});
