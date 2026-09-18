import { describe, expect, test } from "bun:test";
import { splitChatSegments } from "./chat-segments";

describe("splitChatSegments", () => {
  test("returns a single text segment when there is no fence", () => {
    expect(splitChatSegments("Theo structured $5.88M in acquisitions.")).toEqual([
      { kind: "text", value: "Theo structured $5.88M in acquisitions." },
    ]);
  });

  test("renders native Mermaid DSL in a ```mermaid fence as a diagram segment", () => {
    const mermaid = `graph TD\n  A["Lead"] --> B["Outreach"]`;
    const segments = splitChatSegments(`Overview:\n\n\`\`\`mermaid\n${mermaid}\n\`\`\``);
    expect(segments.map((s) => s.kind)).toEqual(["text", "mermaid"]);
    expect(segments[1]).toEqual({ kind: "mermaid", source: mermaid });
  });

  // The panel streams tokens, so a fence is incomplete for as long as it
  // takes the model to write the diagram. Showing raw text mid-stream looks
  // broken; the diagram appears once the closing fence lands.
  test("hides a fence that has not closed yet instead of leaking raw text", () => {
    const segments = splitChatSegments("Overview:\n\n```mermaid\ngraph TD\n  A -->");
    expect(segments).toEqual([{ kind: "text", value: "Overview:" }]);
  });

  test("drops an unfenced chart-tool spec instead of printing raw JSON (already rendered via the chart event)", () => {
    const bar = '{"kind":"bar","title":"Skills by category","data":[{"label":"Quant","value":5}]}';
    expect(splitChatSegments(`Here are his skills.\n\n${bar}`)).toEqual([{ kind: "text", value: "Here are his skills." }]);
  });

  test("drops a fenced chart-tool spec too", () => {
    const bar = '{"kind":"bar","title":"Skills","data":[{"label":"Quant","value":5}]}';
    expect(splitChatSegments("Stats:\n\n```json\n" + bar + "\n```")).toEqual([{ kind: "text", value: "Stats:" }]);
  });

  // Regression: the model doesn't only echo the bare ChartSpec — it more
  // often echoes the whole `tool` role message it was handed back in
  // context, which is `{"chart": ChartSpec}`, sometimes array-wrapped. Seen
  // live on theodouwes.com after "Show his skills as a chart": the chart
  // rendered from the `chart` SSE event, then the reply printed
  // `[{"chart": {"data": [...]}}]` as trailing text underneath it.
  test("drops the array-wrapped tool-result payload the model echoed verbatim", () => {
    const leaked =
      '[{"chart":{"kind":"bar","title":"Skills by category","unit":"skills",' +
      '"data":[{"label":"Roles & focus","value":12},{"label":"Python / data / ML","value":13}]}}]';
    expect(splitChatSegments(`Here's Theo's skills by category.\n\n${leaked}`)).toEqual([
      { kind: "text", value: "Here's Theo's skills by category." },
    ]);
  });

  test("drops the unwrapped {chart: ChartSpec} tool-result payload too", () => {
    const leaked = '{"chart":{"kind":"bar","title":"Skills","data":[{"label":"Quant","value":5}]}}';
    expect(splitChatSegments(`His skills:\n\n${leaked}`)).toEqual([{ kind: "text", value: "His skills:" }]);
  });

  test("drops a fenced array-wrapped tool-result payload too", () => {
    const leaked = '[{"chart":{"kind":"bar","title":"Skills","data":[{"label":"Quant","value":5}]}}]';
    expect(splitChatSegments("Stats:\n\n```json\n" + leaked + "\n```")).toEqual([{ kind: "text", value: "Stats:" }]);
  });

  test("leaves JSON that is not a chart-tool spec as text", () => {
    const segments = splitChatSegments('```json\n{"employer":"Navigara"}\n```');
    expect(segments.every((s) => s.kind === "text")).toBe(true);
  });

  test("keeps an unparseable fence as text rather than handing bad content to the renderer", () => {
    const segments = splitChatSegments("```mermaid\nnot mermaid at all\n```");
    expect(segments.every((s) => s.kind === "text")).toBe(true);
  });

  // Live defect, 2026-09-18: on the second question of a session, models
  // "redrew" the already-rendered chart as text instead of referring to it
  // in words — a markdown image, a raw <img> tag, and unsupported diagram
  // DSL. None of that is a chart; drop it, keep the prose around it.
  test("strips a malformed markdown image (spaces in the url) without dropping the surrounding prose", () => {
    const text = "His chart is above. ![Skills chart](chart rendered above) Ask about a category.";
    expect(splitChatSegments(text)).toEqual([{ kind: "text", value: "His chart is above.  Ask about a category." }]);
  });

  test("strips a raw <img> tag typed into the reply", () => {
    const text = 'Skills breakdown: <img src="x" alt="Skills by category"> see above.';
    expect(splitChatSegments(text)).toEqual([{ kind: "text", value: "Skills breakdown:  see above." }]);
  });

  test("drops an unsupported diagram fence (xychart/bar DSL) instead of printing it raw", () => {
    const dsl = '```mermaid\nxychart-beta\n  title "Skills"\n  x-axis [Quant, ML]\n  bar [5, 8]\n```';
    expect(splitChatSegments(`His skills:\n\n${dsl}\n\nAsk away.`)).toEqual([
      { kind: "text", value: "His skills:" },
      { kind: "text", value: "Ask away." },
    ]);
  });

  test("drops an unsupported diagram fence even when labeled with an invented chart language", () => {
    const dsl = "```chart\nbar\ntitle Skills\nx-axis Quant, ML\n```";
    expect(splitChatSegments(dsl)).toEqual([]);
  });

  test("drops segments that are empty after trimming", () => {
    expect(splitChatSegments("   \n  ")).toEqual([]);
  });

  test("handles several diagrams in one reply", () => {
    const mermaid = "graph TD\n  A --> B";
    const text = `A\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n\nB\n\n\`\`\`mermaid\n${mermaid}\n\`\`\``;
    expect(splitChatSegments(text).map((s) => s.kind)).toEqual(["text", "mermaid", "text", "mermaid"]);
  });
});

describe("model roster", () => {
  test("leads with free models and keeps a paid backstop behind them", async () => {
    const { MODELS } = await import("./models");
    expect(MODELS.length).toBeGreaterThanOrEqual(2);
    expect(MODELS[0].endsWith(":free")).toBe(true);
    expect(MODELS.some((m) => !m.endsWith(":free"))).toBe(true);
  });

  test("keeps more than one lab in the roster so one outage is not the whole cascade", async () => {
    const { MODELS } = await import("./models");
    const labs = new Set(MODELS.map((m) => m.split("/")[0]));
    expect(labs.size).toBeGreaterThanOrEqual(2);
  });
});

describe("isPinnedToBottom", () => {
  test("is true at the bottom, true within the slack, false once scrolled up", async () => {
    const { isPinnedToBottom } = await import("./chat-scroll");
    expect(isPinnedToBottom({ scrollTop: 900, scrollHeight: 1000, clientHeight: 100 })).toBe(true);
    expect(isPinnedToBottom({ scrollTop: 860, scrollHeight: 1000, clientHeight: 100 })).toBe(true);
    expect(isPinnedToBottom({ scrollTop: 200, scrollHeight: 1000, clientHeight: 100 })).toBe(false);
  });
});

describe("markdown image with parentheses in its target (live 2026-09-18)", () => {
  test("removes the whole image, not just up to the first ')'", () => {
    const text = splitChatSegments("Here is the chart. ![Skills by category](chart above: Analytics & BI (14), Engineering & Platform (12), and Business Systems (7).) Ask about any of them.").map((s) => (s as { value?: string }).value ?? "").join("");
    expect(text).not.toContain("![");
    expect(text).not.toContain("(12)");
    expect(text).toContain("Here is the chart.");
    expect(text).toContain("Ask about any of them.");
  });
});
