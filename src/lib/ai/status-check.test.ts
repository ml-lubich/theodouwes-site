import { afterEach, describe, expect, test } from "bun:test";
import { checkAllModels, checkModelStatus, publicError } from "./status-check";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("checkModelStatus", () => {
  test("reports ok with status and latency on a 2xx", async () => {
    globalThis.fetch = (async () => new Response("{}", { status: 200 })) as typeof fetch;
    const result = await checkModelStatus("some/model:free", "key");
    expect(result).toMatchObject({ model: "some/model:free", ok: true, status: 200 });
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  test("reports the HTTP status and a truncated body on a non-2xx", async () => {
    globalThis.fetch = (async () =>
      new Response("x".repeat(500), { status: 429, statusText: "Too Many Requests" })) as typeof fetch;
    const result = await checkModelStatus("some/model:free", "key");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(429);
    expect(result.error?.length).toBeLessThanOrEqual(200);
  });

  test("reports a network/timeout failure without throwing", async () => {
    globalThis.fetch = (async () => {
      throw new Error("The operation was aborted");
    }) as typeof fetch;
    const result = await checkModelStatus("some/model:free", "key");
    expect(result.ok).toBe(false);
    expect(result.status).toBeUndefined();
    expect(result.error).toContain("aborted");
  });

  test("never sends the API key in the response it reports", async () => {
    globalThis.fetch = (async () => new Response("secret-key-leak", { status: 500 })) as typeof fetch;
    const result = await checkModelStatus("some/model:free", "sk-super-secret");
    expect(JSON.stringify(result)).not.toContain("sk-super-secret");
  });

  // /status is public — a key-management URL in the upstream error body
  // must never reach the page. Regression for the 2026-09-18 live incident.
  test("never leaks an upstream key-management URL through the displayed error", async () => {
    const body = JSON.stringify({
      error: {
        message:
          "Key limit exceeded (monthly limit). Manage it using https://openrouter.ai/workspaces/default/keys/abc123",
        code: 403,
      },
    });
    globalThis.fetch = (async () => new Response(body, { status: 403 })) as typeof fetch;
    const result = await checkModelStatus("some/model", "key");
    expect(result.error).toBe("Key limit exceeded (monthly limit).");
    expect(result.error).not.toContain("openrouter.ai/workspaces");
  });
});

describe("checkAllModels", () => {
  test("checks every model in parallel and keeps per-model results independent", async () => {
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      if (body.model === "bad/model") return new Response("nope", { status: 503 });
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    const results = await checkAllModels(["good/model", "bad/model"], "key");
    expect(results).toHaveLength(2);
    expect(results.find((r) => r.model === "good/model")).toMatchObject({ ok: true });
    expect(results.find((r) => r.model === "bad/model")).toMatchObject({ ok: false, status: 503 });
  });
});

describe("publicError", () => {
  test("keeps OpenRouter's message and drops key-management URLs", () => {
    const body = JSON.stringify({
      error: {
        message:
          "Key limit exceeded (monthly limit). Manage it using https://openrouter.ai/workspaces/default/keys/abc123",
        code: 403,
      },
    });
    expect(publicError(body)).toBe("Key limit exceeded (monthly limit).");
  });

  test("falls back to the raw text when the body is not JSON", () => {
    expect(publicError("Bad gateway")).toBe("Bad gateway");
  });
});
