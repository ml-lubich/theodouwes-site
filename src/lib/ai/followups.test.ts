import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";
import { clampFollowup, FOLLOWUP_LIMITS, parseFollowups, splitFollowup } from "./followups";

const panel = readFileSync(resolve(import.meta.dir, "../../components/TheoAI.tsx"), "utf8");

describe("splitFollowup", () => {
  test("splits `label :: question` into the pill label and the sent question", () => {
    expect(splitFollowup("Navigara playbooks :: What GTM playbooks did he write at Navigara?")).toEqual({
      label: "Navigara playbooks",
      question: "What GTM playbooks did he write at Navigara?",
    });
  });

  test("falls back to the same text for both when there is no separator", () => {
    expect(splitFollowup("Where has he worked?")).toEqual({
      label: "Where has he worked?",
      question: "Where has he worked?",
    });
  });

  test("keeps a question containing a colon intact", () => {
    expect(splitFollowup("Stack :: What runs where: R Shiny or Excel?")).toEqual({
      label: "Stack",
      question: "What runs where: R Shiny or Excel?",
    });
  });

  test("uses the surviving half when one side is empty", () => {
    expect(splitFollowup(":: Only the question?")).toEqual({
      label: "Only the question?",
      question: "Only the question?",
    });
    expect(splitFollowup("Only a label ::")).toEqual({ label: "Only a label", question: "Only a label" });
  });

  test("survives the pipe-splitting the server already does", () => {
    const parsed = parseFollowups("Navigara :: What has he shipped at Navigara? | Piedmont :: What did he model at Piedmont?");
    expect(parsed.map(splitFollowup)).toEqual([
      { label: "Navigara", question: "What has he shipped at Navigara?" },
      { label: "Piedmont", question: "What did he model at Piedmont?" },
    ]);
  });

  test("still clamps an over-long label without touching the question", () => {
    const raw = "A label that runs on well past the pill width budget for one line :: Q?";
    const { label, question } = splitFollowup(raw);
    expect(question).toBe("Q?");
    expect(clampFollowup(label).endsWith("…")).toBe(true);
  });
});

describe("follow-up text is never cut mid-word", () => {
  test("trims the label at a word boundary", () => {
    const long = "What is inside the multifamily holding-period model exactly and why?";
    expect(parseFollowups(long)).toEqual([long]);
    const only = clampFollowup(long);
    expect(only.endsWith("…")).toBe(true);
    const kept = only.slice(0, -1);
    expect(long.startsWith(kept)).toBe(true);
    expect(long[kept.length]).toBe(" ");
  });

  test("drops repeats so the same question cannot appear twice", () => {
    expect(parseFollowups("Same one? | Different? | same one?")).toEqual(["Same one?", "Different?"]);
  });
});

describe("follow-up prompt", () => {
  test("asks for fragments short enough to fit one line in the panel", () => {
    expect(FOLLOWUP_LIMITS.maxChars).toBeLessThanOrEqual(56);
  });
});

describe("TheoAI follow-up pills", () => {
  const pills = panel.slice(panel.indexOf("turn.followups?.length"), panel.indexOf("turn.followups?.length") + 900);

  test("sends the full question on click, and only shortens the label", () => {
    expect(pills).toMatch(/onClick=\{\(\) => send\(q\.question\)\}/);
    expect(pills).toMatch(/\{clampFollowup\(q\.label\)\}/);
    expect(pills).toContain("title={q.question}");
    expect(pills).toContain("aria-label={q.question}");
  });

  test("keeps the pills mounted but disabled while a reply streams, rather than hiding them", () => {
    expect(pills).toMatch(/disabled=\{busy\}/);
  });

  test("shows the whole question in the pill rather than clipping it with CSS truncation", () => {
    expect(pills).not.toContain("truncate");
  });
});
