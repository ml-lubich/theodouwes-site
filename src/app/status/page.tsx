import type { Metadata } from "next";
import { MODELS } from "@/lib/ai/models";
import { checkAllModels, type ModelStatus } from "@/lib/ai/status-check";

// Unlisted diagnostics page — no nav/footer/sitemap entry, noindex below,
// and disallowed in robots.ts. Re-checks at most once a day so it never
// spends chat budget on crawlers.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "TheoAI status",
  robots: { index: false, follow: false },
};

export default async function StatusPage() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const configured = Boolean(apiKey?.startsWith("sk-or-"));
  const results = configured ? await checkAllModels(MODELS, apiKey as string) : null;
  const checkedAt = new Date().toISOString();

  return (
    <main className="status-page">
      <h1>TheoAI status</h1>
      <p className="status-lede">
        Live check of every model in the free-tier OpenRouter cascade used by <code>/api/chat</code>.
      </p>

      <section className="status-card">
        <p className="status-card-label">Chat configured</p>
        <span className={`status-badge ${configured ? "is-ok" : "is-fail"}`}>
          {configured ? "yes — OPENROUTER_API_KEY present" : "no — OPENROUTER_API_KEY missing"}
        </span>
      </section>

      <div className="status-rows">
        {results === null && (
          <p className="status-empty">Chat is not configured — no API key, so no models were checked.</p>
        )}
        {results?.map((r) => <ModelRow key={r.model} result={r} />)}
      </div>

      <p className="status-checked-at">Checked at {checkedAt} UTC</p>
    </main>
  );
}

function ModelRow({ result }: { result: ModelStatus }) {
  return (
    <div className="status-card status-row">
      <div className="status-row-main">
        <code className="status-model">{result.model}</code>
        {!result.ok && (
          <p className="status-error">
            {result.status ? `HTTP ${result.status}: ` : ""}
            {result.error}
          </p>
        )}
      </div>
      <div className="status-row-meta">
        <span>{result.latencyMs}ms</span>
        <span className={`status-badge ${result.ok ? "is-ok" : "is-fail"}`}>{result.ok ? "OK" : "FAIL"}</span>
      </div>
    </div>
  );
}
