/**
 * ─── TheoAI status checks ───────────────────────────────────────────────
 *
 * Pings every model in the chat cascade with a throwaway completion so
 * /status can show which ones are actually answering right now, not just
 * which slugs are configured.
 */

export interface ModelStatus {
  model: string;
  ok: boolean;
  status?: number;
  error?: string;
  latencyMs: number;
}

/** One minimal completion against a single model. Never throws — a network
 *  failure or non-2xx becomes `ok: false` with the reason attached. */
export async function checkModelStatus(
  model: string,
  apiKey: string,
): Promise<ModelStatus> {
  const start = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 5,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) return { model, ok: true, status: res.status, latencyMs };
    return {
      model,
      ok: false,
      status: res.status,
      error: publicError(await res.text().catch(() => "")) || res.statusText,
      latencyMs,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { model, ok: false, error: message.slice(0, 200), latencyMs: Date.now() - start };
  }
}

/** /status is public: keep OpenRouter's `error.message` only and drop URLs,
 *  which can carry account/key-management identifiers (live 2026-09-18: a
 *  403 body linked straight to the key's management page). */
export function publicError(body: string): string {
  let message = body;
  try {
    message = JSON.parse(body)?.error?.message ?? body;
  } catch {
    // Not JSON — use the raw text.
  }
  // Cut at the first URL, back to the end of the last whole sentence before it.
  const [beforeUrl] = message.split(/https?:\/\//);
  const cut =
    beforeUrl.length < message.length && beforeUrl.includes(".")
      ? beforeUrl.slice(0, beforeUrl.lastIndexOf(".") + 1)
      : beforeUrl;
  return cut.replace(/\s+/g, " ").trim().slice(0, 200);
}

/** Checks every model in parallel; one slow/failing model never blocks another. */
export async function checkAllModels(
  models: readonly string[],
  apiKey: string,
): Promise<ModelStatus[]> {
  const settled = await Promise.allSettled(models.map((model) => checkModelStatus(model, apiKey)));
  return settled.map((result, i) =>
    result.status === "fulfilled"
      ? result.value
      : { model: models[i], ok: false, error: "status check threw", latencyMs: 0 },
  );
}
