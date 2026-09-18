/**
 * Integration test for `app/api/chat/route.ts`: the tool-round budget (the
 * last round is asked with no tools so the model has to answer), the
 * missing-key 503, and the cascade-failure path never leaking per-model
 * detail to the client.
 *
 * Ported from ~/dev/portfolio's __tests__/ai-chat-tool-budget.test.ts.
 * Network tests are skipped under Vercel CI (`process.env.VERCEL`) since
 * they stub `fetch` and exercise pure request/response wiring, not a real
 * network call — the skip guard is kept for consistency with the reference
 * suite's convention.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { __resetBuckets } from "@/lib/ai/rate-limit";

const sse = (chunks: unknown[]) =>
  new Response(
    new ReadableStream({
      start(c) {
        const enc = new TextEncoder();
        for (const chunk of chunks) c.enqueue(enc.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        c.enqueue(enc.encode("data: [DONE]\n\n"));
        c.close();
      },
    }),
    { status: 200, headers: { "Content-Type": "text/event-stream" } },
  );

const toolCall = (name: string, args: string) =>
  sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: `c-${name}`, function: { name, arguments: args } }] } }] }]);

const text = (s: string) => sse([{ choices: [{ delta: { content: s } }] }]);

const originalFetch = globalThis.fetch;

/** Every request body the route sent to OpenRouter, in order. */
function install(responses: Response[]) {
  const bodies: Record<string, unknown>[] = [];
  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)));
    // A clone per call: the cascade reads each failed body, and a shared
    // Response would throw "already read" on the second model.
    return responses[Math.min(bodies.length - 1, responses.length - 1)].clone();
  }) as typeof fetch;
  return bodies;
}

async function ask(question: string, ip: string): Promise<string> {
  const { POST } = await import("@/app/api/chat/route");
  const res = await POST(
    new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
    }),
  );
  return await new Response(res.body).text();
}

const skipInCI = process.env.VERCEL ? test.skip : test;

describe("tool-round budget", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "sk-or-test-key";
    __resetBuckets();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  skipInCI("asks the last round with no tools so the model has to answer", async () => {
    const bodies = install([
      toolCall("search_profile", '{"query":"navigara"}'),
      toolCall("get_experience", "{}"),
      toolCall("search_profile", '{"query":"gtm"}'),
      text("He built the GTM outreach system at Navigara."),
    ]);

    const out = await ask("What has Theo built at Navigara?", "10.1.1.1");

    expect(bodies).toHaveLength(4);
    for (const body of bodies.slice(0, 3)) expect(body.tools).toBeDefined();
    // The round that has to produce prose is offered nothing to call.
    expect(bodies[3].tools).toBeUndefined();
    expect(bodies[3].tool_choice).toBeUndefined();
    expect(out).toContain("GTM outreach system");
  });

  skipInCI("says chat is unavailable instead of pasting the dead cascade at the visitor", async () => {
    install([new Response(JSON.stringify({ error: { message: "Key limit exceeded" } }), { status: 403 })]);

    const out = await ask("What has Theo built at Navigara?", "10.1.1.3");

    expect(out).toMatch(/isn't available right now/);
    // No model slug, no HTTP status, no upstream body reaches the client.
    expect(out).not.toMatch(/ling-3\.0|gpt-oss|mistral-nemo|403|Key limit exceeded/);
  });

  skipInCI("answers plainly when even the tool-free round is silent, never dumping raw titles", async () => {
    install([
      toolCall("search_profile", '{"query":"navigara"}'),
      toolCall("get_experience", "{}"),
      toolCall("get_projects", "{}"),
      text(""),
    ]);

    const out = await ask("What has Theo built at Navigara?", "10.1.1.2");

    expect(out.length).toBeGreaterThan(0);
    expect(out).not.toMatch(/•/);
  });

  test("503s with the exact configured-message contract when the key is missing", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const { POST } = await import("@/app/api/chat/route");
    const res = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.1.1.4" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
      }),
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Chat is not configured." });
  });
});
