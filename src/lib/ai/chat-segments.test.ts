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

  test("leaves JSON that is not a chart-tool spec as text", () => {
    const segments = splitChatSegments('```json\n{"employer":"Navigara"}\n```');
    expect(segments.every((s) => s.kind === "text")).toBe(true);
  });

  test("keeps an unparseable fence as text rather than handing bad content to the renderer", () => {
    const segments = splitChatSegments("```mermaid\nnot mermaid at all\n```");
    expect(segments.every((s) => s.kind === "text")).toBe(true);
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
