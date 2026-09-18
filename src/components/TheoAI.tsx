"use client";

/**
 * ─── TheoAI ───────────────────────────────────────────────────────────
 *
 * Floating chat launcher + panel, bottom-right. Talks to `/api/chat`, which
 * streams SSE frames: `text` (token delta), `tool` (a lookup started),
 * `chart` (a spec to render), `contact` (a hand-off card), `followups`,
 * `error`, `done`.
 *
 * Ported from the reference chat implementations (~/dev/portfolio's MLBot,
 * ~/dev/ashveer-site's AshveerAI) and adapted to this site's plain-CSS,
 * token-driven design system — no Tailwind, no icon library, monochrome.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isPinnedToBottom } from "@/lib/ai/chat-scroll";
import { splitChatSegments } from "@/lib/ai/chat-segments";
import { stripCardLinks } from "@/lib/ai/card-links";
import { clampFollowup, splitFollowup, type Followup } from "@/lib/ai/followups";
import { TOOL_LABELS, collapseToolSteps, type ToolStep } from "@/lib/ai/tool-labels";
import type { ChartSpec, ContactSpec } from "@/lib/ai/profile-tools";
import { TheoAIChart } from "@/components/TheoAIChart";
import { TheoAIMermaid } from "@/components/TheoAIMermaid";
import { TheoAIContactCard } from "@/components/TheoAIContactCard";

interface Turn {
  role: "user" | "assistant";
  content: string;
  charts?: ChartSpec[];
  tools?: ToolStep[];
  followups?: Followup[];
  /** Email/LinkedIn/GitHub hand-off, when the visitor asked how to reach him. */
  contact?: ContactSpec;
}

const SUGGESTIONS = [
  "What does Theo build at Navigara?",
  "Chart his skills by category",
  "Walk me through his career",
  "What has he published?",
];

/* Cycled while waiting. The site's own vocabulary rather than a generic
 * "Thinking…" — the motion says it is alive rather than hung, which is most
 * of what a loading state is for. */
const THINKING_VERBS = ["Underwriting", "Modeling", "Structuring", "Estimating", "Retrieving", "Drafting"] as const;

function ThinkingVerb() {
  const [i, setI] = useState(() => Math.floor(Math.random() * THINKING_VERBS.length));

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % THINKING_VERBS.length), 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="theoai-thinking">
      <span key={i} className="theoai-verb">
        {THINKING_VERBS[i]}
      </span>
      <span className="theoai-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </p>
  );
}

function ToolStepRow({ name, done, index }: ToolStep & { index: number }) {
  return (
    <p data-theoai-tool className={`theoai-tool${done ? " is-done" : ""}`}>
      <span className="theoai-tool-index" aria-hidden="true">
        {index + 1}
      </span>
      {TOOL_LABELS[name]}
      {!done && <span className="theoai-tool-running"> — running</span>}
    </p>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="1.5" />
    </svg>
  );
}

export function TheoAI() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  /** Bumped on close/new-chat so a late frame from an old request can never
   *  write into a transcript it no longer belongs to. */
  const runRef = useRef(0);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Follow the stream. `turns` changes on every token, so this runs as the
  // reply grows — but only while the reader is already at the bottom, so
  // scrolling up to re-read an earlier answer is not yanked back down.
  useEffect(() => {
    const el = logRef.current;
    if (!el || !isPinnedToBottom(el)) return;
    el.scrollTo({ top: el.scrollHeight, behavior: busy ? "auto" : "smooth" });
  }, [turns, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Closing the panel ends the answer it was writing.
  useEffect(() => {
    if (open) return;
    runRef.current++;
    abortRef.current?.abort();
  }, [open]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const newChat = useCallback(() => {
    runRef.current++;
    stop();
    setTurns([]);
    setInput("");
    inputRef.current?.focus();
  }, [stop]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      // One question at a time. A tap while an answer is streaming is
      // dropped on the spot — nothing is queued behind it.
      if (!question || busyRef.current) return;
      busyRef.current = true;
      const run = ++runRef.current;

      setInput("");
      setBusy(true);

      const history = [...turns, { role: "user" as const, content: question }];
      setTurns([...history, { role: "assistant", content: "", charts: [], tools: [] }]);

      /** Mutates only the in-flight assistant turn (always the last one), and
       *  only while this run still owns the transcript. */
      const patch = (fn: (t: Turn) => Turn) => {
        if (runRef.current !== run) return;
        setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? fn(t) : t)));
      };

      /** A lookup has returned once anything follows it. */
      const settle = (t: Turn): Turn =>
        t.tools?.some((s) => !s.done) ? { ...t, tools: t.tools.map((s) => ({ ...s, done: true })) } : t;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        });

        if (!res.ok || !res.body) {
          const { error } = await res.json().catch(() => ({ error: "Something went wrong." }));
          patch((t) => ({ ...t, content: error ?? "Something went wrong." }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE frames are separated by a blank line.
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const event = frame.match(/^event: (.+)$/m)?.[1];
            const raw = frame.match(/^data: (.+)$/m)?.[1];
            if (!event || !raw) continue;

            let data: unknown;
            try {
              data = JSON.parse(raw);
            } catch {
              continue;
            }

            if (event === "text") {
              patch((t) => ({ ...settle(t), content: t.content + String(data) }));
            } else if (event === "chart") {
              patch((t) => ({ ...settle(t), charts: [...(t.charts ?? []), data as ChartSpec] }));
            } else if (event === "tool") {
              const name = (data as { name: string }).name;
              patch((t) => {
                const prev = settle(t);
                return { ...prev, tools: [...(prev.tools ?? []), { name, done: false }] };
              });
            } else if (event === "contact") {
              patch((t) => ({ ...t, contact: data as ContactSpec }));
            } else if (event === "followups") {
              patch((t) => ({
                ...t,
                followups: (data as (string | Followup)[]).map((f) => (typeof f === "string" ? splitFollowup(f) : f)),
              }));
            } else if (event === "error") {
              patch((t) => ({ ...t, content: (data as { message: string }).message }));
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          patch((t) => (t.content || t.charts?.length ? t : { ...t, content: "Stopped." }));
        } else {
          patch((t) => ({ ...t, content: "Couldn't reach TheoAI. Check your connection and try again." }));
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        patch(settle);
        busyRef.current = false;
        setBusy(false);
      }
    },
    [turns],
  );

  return (
    <>
      <button
        type="button"
        className="theoai-launcher"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close TheoAI" : "Chat with TheoAI"}
        aria-expanded={open}
      >
        <span className="theoai-pip" aria-hidden="true" />
        TheoAI
      </button>

      {open && (
        <div className="theoai-panel" role="dialog" aria-label="Chat with TheoAI">
          <header className="theoai-head">
            <div>
              <p className="theoai-eyebrow">TheoAI · Assistant</p>
              <p className="theoai-sub">Ask about Theo&rsquo;s work</p>
            </div>
            <div className="theoai-head-actions">
              {turns.length > 0 && (
                <button type="button" className="theoai-icon-btn" onClick={newChat} aria-label="New chat" title="New chat">
                  <span aria-hidden="true">+</span>
                </button>
              )}
              <button type="button" className="theoai-icon-btn" onClick={() => setOpen(false)} aria-label="Close TheoAI">
                <CloseIcon />
              </button>
            </div>
          </header>

          <div className="theoai-log" ref={logRef}>
            {turns.length === 0 && (
              <>
                <p className="theoai-intro">
                  I can look through Theo&rsquo;s roles, projects, skills and writing — and chart them.
                </p>
                <div className="theoai-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" className="theoai-chip" disabled={busy} onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <p key={i} className="theoai-turn-user">
                  {turn.content}
                </p>
              ) : (
                <div key={i} className="theoai-turn-bot">
                  {collapseToolSteps(turn.tools ?? []).map(({ name, done }, j) =>
                    TOOL_LABELS[name] ? <ToolStepRow key={j} name={name} done={done} index={j} /> : null,
                  )}

                  {turn.charts?.map((spec, j) => <TheoAIChart key={j} spec={spec} />)}

                  {turn.contact && <TheoAIContactCard contact={turn.contact} />}

                  {splitChatSegments(stripCardLinks(turn.content)).map((seg, j) =>
                    seg.kind === "mermaid" ? (
                      <TheoAIMermaid key={j} source={seg.source} />
                    ) : (
                      <div key={j} className="theoai-md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} disallowedElements={["img"]} unwrapDisallowed>
                          {seg.value}
                        </ReactMarkdown>
                      </div>
                    ),
                  )}

                  {busy && i === turns.length - 1 && !turn.content && !turn.tools?.length && <ThinkingVerb />}

                  {!busy && turn.followups?.length ? (
                    <div className="theoai-chips theoai-followups">
                      {turn.followups.map((q) => (
                        <button
                          key={q.question}
                          type="button"
                          className="theoai-chip"
                          disabled={busy}
                          onClick={() => send(q.question)}
                          title={q.question}
                          aria-label={q.question}
                        >
                          {clampFollowup(q.label)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ),
            )}
          </div>

          <form
            className="theoai-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={inputRef}
              className="theoai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!busy && input.trim()) send(input);
                }
              }}
              rows={1}
              maxLength={1000}
              disabled={busy}
              placeholder={busy ? "TheoAI is answering…" : "Ask about Theo…"}
              aria-label="Message TheoAI"
            />
            {busy ? (
              <button type="button" className="theoai-send" onClick={stop} aria-label="Stop generating" title="Stop generating">
                <StopIcon />
              </button>
            ) : (
              <button type="submit" className="theoai-send" disabled={!input.trim()} aria-label="Send">
                <SendIcon />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
}
