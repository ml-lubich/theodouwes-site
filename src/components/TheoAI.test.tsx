import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { TheoAI } from "./TheoAI";
import { CONTACT_EMAIL } from "@/lib/ai/profile-tools";

/**
 * DOM-level coverage for the three things a source-only assertion cannot
 * prove: a markdown reply actually renders as markdown (no raw "**" or
 * bullet characters reach the page), a `chart` SSE event turns into a
 * mounted chart, and the streaming affordances (tool step, contact card,
 * follow-up pills, stop control) show up while a reply is in flight.
 */

const originalFetch = globalThis.fetch;

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

/** Builds an SSE Response whose frames arrive one macrotask apart, so the
 *  panel's intermediate ("busy") state is observable by `waitFor` instead
 *  of the whole stream resolving inside one microtask. */
function sseResponse(frames: { event: string; data: unknown }[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      for (const frame of frames) {
        await new Promise((r) => setTimeout(r, 0));
        controller.enqueue(encoder.encode(`event: ${frame.event}\ndata: ${JSON.stringify(frame.data)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: "Chat with TheoAI" }));
}

describe("TheoAI", () => {
  test("renders a markdown reply as real markdown, chart, tool step, contact card and follow-ups — no raw ** or bullets", async () => {
    const calls: RequestInit[] = [];
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      calls.push(init!);
      return sseResponse([
        { event: "tool", data: { name: "get_experience" } },
        { event: "text", data: "**Navigara** is where he works:\n\n- GTM automation\n- Sales engineering\n\n" },
        {
          event: "chart",
          data: { kind: "bar", title: "Skills by category", unit: "skills", data: [{ label: "Quant", value: 5 }] },
        },
        {
          event: "contact",
          data: {
            name: "Theo Douwes",
            title: "GTM Engineer",
            email: CONTACT_EMAIL,
            mailto: `mailto:${CONTACT_EMAIL}`,
            phone: "+1-000-000-0000",
            linkedin: "https://linkedin.com/in/theo",
            github: "https://github.com/theo",
            medium: "https://medium.com/theo",
            summary: "Email reaches him directly.",
          },
        },
        { event: "followups", data: ["Navigara playbooks :: What playbooks has he written at Navigara?"] },
        { event: "done", data: {} },
      ]);
    }) as typeof fetch;

    render(<TheoAI />);
    openPanel();

    fireEvent.click(screen.getByText("What does Theo build at Navigara?"));

    // Streaming affordance: the tool lookup shows before the answer settles.
    await waitFor(() => expect(screen.getByText(/Reading career history/)).toBeTruthy());

    // Markdown renders as real markup, not literal syntax.
    await waitFor(() => expect(screen.getByText("Navigara").tagName).toBe("STRONG"));
    const log = document.querySelector(".theoai-log")!;
    expect(log.textContent).not.toContain("**");
    expect(log.textContent).not.toMatch(/•/);
    expect(log.querySelectorAll(".theoai-md li").length).toBe(2);

    // The chart SSE event reached the client and mounted a chart.
    await waitFor(() => expect(log.querySelector(".theoai-chart")).toBeTruthy());
    expect(within(log.querySelector(".theoai-chart") as HTMLElement).getByText(/Skills by category/)).toBeTruthy();

    // The contact card carries the real, already-public address.
    await waitFor(() => expect(log.querySelector(".theoai-card")).toBeTruthy());
    const mailLink = log.querySelector(`a[href="mailto:${CONTACT_EMAIL}"]`);
    expect(mailLink).toBeTruthy();

    // Follow-up pill: short label shown, full question sent on click.
    await waitFor(() => expect(screen.getByText("Navigara playbooks")).toBeTruthy());
    fireEvent.click(screen.getByText("Navigara playbooks"));

    await waitFor(() => expect(calls.length).toBe(2));
    const secondBody = JSON.parse(String(calls[1].body));
    expect(secondBody.messages.at(-1).content).toBe("What playbooks has he written at Navigara?");
  });

  test("shows a stop control while a reply is streaming, and aborts the request", async () => {
    let aborted = false;
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      const signal = init?.signal as AbortSignal;
      signal.addEventListener("abort", () => {
        aborted = true;
      });
      return sseResponse([
        { event: "text", data: "Working on it" },
        { event: "text", data: " — still going." },
        { event: "done", data: {} },
      ]);
    }) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    fireEvent.click(screen.getByText("Chart his skills by category"));

    const stopButton = await screen.findByRole("button", { name: "Stop generating" });
    fireEvent.click(stopButton);
    expect(aborted).toBe(true);
  });

  test("typing and pressing Enter sends the message; Shift+Enter does not", async () => {
    const calls: RequestInit[] = [];
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      calls.push(init!);
      return sseResponse([{ event: "text", data: "Answer." }, { event: "done", data: {} }]);
    }) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    const box = screen.getByLabelText("Message TheoAI");

    fireEvent.change(box, { target: { value: "Hi there" } });
    fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(calls).toHaveLength(0);

    fireEvent.keyDown(box, { key: "Enter" });
    await waitFor(() => expect(calls).toHaveLength(1));
    const body = JSON.parse(String(calls[0].body));
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "Hi there" });
  });

  test("submitting the form sends the typed message", async () => {
    const calls: RequestInit[] = [];
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      calls.push(init!);
      return sseResponse([{ event: "text", data: "Answer." }, { event: "done", data: {} }]);
    }) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    fireEvent.change(screen.getByLabelText("Message TheoAI"), { target: { value: "Submit path" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(calls).toHaveLength(1));
  });

  test("shows the server's error text on a non-2xx HTTP response", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: "You've hit the hourly message limit." }), { status: 429 })) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    fireEvent.click(screen.getByText("What does Theo build at Navigara?"));

    await waitFor(() => expect(screen.getByText("You've hit the hourly message limit.")).toBeTruthy());
  });

  test("renders an `error` SSE event as the assistant's message", async () => {
    globalThis.fetch = (async () =>
      sseResponse([{ event: "error", data: { message: "TheoAI isn't available right now." } }, { event: "done", data: {} }])) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    fireEvent.click(screen.getByText("What does Theo build at Navigara?"));

    await waitFor(() => expect(screen.getByText("TheoAI isn't available right now.")).toBeTruthy());
  });

  test("shows a friendly message when the request fails outright", async () => {
    globalThis.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    fireEvent.click(screen.getByText("What does Theo build at Navigara?"));

    await waitFor(() => expect(screen.getByText(/Couldn't reach TheoAI/)).toBeTruthy());
  });

  test("stopping before any text arrived leaves a 'Stopped.' message, not an error", async () => {
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      const signal = init?.signal as AbortSignal;
      return new Promise<Response>((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    }) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    fireEvent.click(screen.getByText("What does Theo build at Navigara?"));

    const stopButton = await screen.findByRole("button", { name: "Stop generating" });
    fireEvent.click(stopButton);

    await waitFor(() => expect(screen.getByText("Stopped.")).toBeTruthy());
  });

  test("new chat clears the transcript", async () => {
    globalThis.fetch = (async () => sseResponse([{ event: "text", data: "Answer." }, { event: "done", data: {} }])) as typeof fetch;

    render(<TheoAI />);
    openPanel();
    fireEvent.click(screen.getByText("What does Theo build at Navigara?"));

    await waitFor(() => expect(screen.getByText("What does Theo build at Navigara?", { selector: "p" })).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    expect(screen.queryByText("Answer.")).toBeNull();
    expect(screen.getByText(/I can look through Theo/)).toBeTruthy();
  });
});
