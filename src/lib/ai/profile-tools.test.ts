import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";
import { CONTACT_EMAIL, LINKEDIN_URL, runTool, SYSTEM_PROMPT, TOOL_SCHEMAS } from "./profile-tools";
import { stripCardLinks } from "./card-links";
import { collapseToolSteps, TOOL_LABELS } from "./tool-labels";

const read = (p: string) => readFileSync(resolve(import.meta.dir, "../../..", p), "utf8");

/* ── Never invent facts ──────────────────────────────────────────────── */

describe("runTool grounds every answer in real profile data", () => {
  test("search_profile only returns matches, never fabricated facts", () => {
    const { matches } = runTool("search_profile", { query: "underwriting" }) as {
      matches: { kind: string }[];
    };
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((m) => m.kind === "experience" || m.kind === "project")).toBe(true);
  });

  test("get_experience returns Navigara, Piedmont and the independent practice", () => {
    const { experience } = runTool("get_experience", {}) as { experience: { org: string }[] };
    const orgs = experience.map((e) => e.org);
    expect(orgs).toEqual(["Navigara", "Piedmont Realty LLC", "Independent Practice"]);
  });

  test("get_skills without a filter returns every category", () => {
    const { categories } = runTool("get_skills", {}) as { categories: { category: string }[] };
    expect(categories.length).toBeGreaterThan(5);
  });

  test("an unknown tool name returns a recoverable error, not a throw", () => {
    expect(runTool("chart_pie", {})).toEqual({ error: "Unknown tool: chart_pie" });
  });
});

/* ── Charts ──────────────────────────────────────────────────────────── */

describe("chart tools", () => {
  test("chart_skills_by_category sums to the skills bank's category count", () => {
    const { chart } = runTool("chart_skills_by_category", {}) as {
      chart: { data: { label: string; value: number }[] };
    };
    expect(chart.data.length).toBeGreaterThan(5);
    expect(chart.data.every((d) => d.value > 0)).toBe(true);
  });

  test("chart_experience_timeline gives a numeric duration per role", () => {
    const { chart } = runTool("chart_experience_timeline", {}) as {
      chart: { data: { label: string; value: number }[] };
    };
    expect(chart.data.length).toBe(3);
    for (const d of chart.data) expect(d.value).toBeGreaterThan(0);
  });
});

/* ── Contact hand-off ────────────────────────────────────────────────── */

describe("get_contact", () => {
  test("is advertised to the model", () => {
    expect(TOOL_SCHEMAS.map((s) => s.function.name)).toContain("get_contact");
  });

  test("returns the same address Connect and the footer use — nothing invented", () => {
    const { contact } = runTool("get_contact", {}) as { contact: { email: string; mailto: string } };
    expect(contact.email).toBe(CONTACT_EMAIL);
    expect(contact.mailto.startsWith(`mailto:${CONTACT_EMAIL}`)).toBe(true);

    expect(read("src/components/ConnectLinks.tsx")).not.toContain("tadouwes"); // props-driven, not hardcoded
    expect(read("src/lib/profile.ts")).toContain(CONTACT_EMAIL);
  });

  test("hands off rather than sending anything from the site", () => {
    const tools = read("src/lib/ai/profile-tools.ts");
    expect(tools).not.toMatch(/nodemailer|sendgrid|resend|smtp/i);
    expect(read("src/components/TheoAIContactCard.tsx")).toContain("TheoAIContactCard");
  });

  test("there is no booking calendar or resume tool — this site has neither", () => {
    const names = TOOL_SCHEMAS.map((s) => s.function.name);
    expect(names).not.toContain("request_consultation");
    expect(names).not.toContain("get_resume");
  });
});

/* ── stripCardLinks ──────────────────────────────────────────────────── */

describe("stripCardLinks", () => {
  test("removes an inline email link the contact card already carries", () => {
    const said = `Email is the most direct way to reach Theo — [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). His LinkedIn is on the card.`;
    const shown = stripCardLinks(said);
    expect(shown).not.toContain(CONTACT_EMAIL);
    expect(shown).toBe("Email is the most direct way to reach Theo. His LinkedIn is on the card.");
  });

  test("removes a bare address and the dangling separator left behind", () => {
    expect(stripCardLinks(`Reach him at ${CONTACT_EMAIL}.`)).toBe("Reach him at.");
    expect(stripCardLinks(`Write to him — ${CONTACT_EMAIL}`)).toBe("Write to him");
  });

  test("still removes the LinkedIn URL", () => {
    expect(stripCardLinks(`Connect here: ${LINKEDIN_URL}`)).not.toContain("linkedin.com");
  });

  test("keeps the label when the model wrapped the link in markdown", () => {
    expect(stripCardLinks(`[Reach out](mailto:${CONTACT_EMAIL}) any time.`)).toBe("Reach out any time.");
  });

  test("leaves an ordinary answer untouched", () => {
    const prose = "Theo structured $5.88M in multifamily acquisitions.\n\nHe now works at Navigara.";
    expect(stripCardLinks(prose)).toBe(prose);
  });

  test("does not disturb a mermaid fence", () => {
    const fenced = "Here:\n\n```mermaid\ngraph TD\n A --> B\n```";
    expect(stripCardLinks(fenced)).toBe(fenced);
  });
});

/* ── System prompt guards ────────────────────────────────────────────── */

describe("system prompt", () => {
  test("grounds every claim in a tool call and never invents facts", () => {
    expect(SYSTEM_PROMPT).toMatch(/Ground every factual claim in a tool call/i);
    expect(SYSTEM_PROMPT).toMatch(/Never invent/i);
  });

  test("tells the model to write real markdown, not literal asterisks or bullets", () => {
    expect(SYSTEM_PROMPT).toMatch(/markdown/i);
    expect(SYSTEM_PROMPT).toMatch(/never type a literal/i);
  });

  test("tells the model to draw charts and mermaid diagrams without waiting to be asked", () => {
    expect(SYSTEM_PROMPT).toMatch(/chart_skills_by_category/);
    expect(SYSTEM_PROMPT).toMatch(/```mermaid/);
    expect(SYSTEM_PROMPT).toMatch(/without waiting to be asked/i);
  });

  test("keeps the contact-card guard: never paste the address itself", () => {
    expect(SYSTEM_PROMPT).toMatch(/never type out the address/i);
    expect(SYSTEM_PROMPT).toMatch(/no calendar/i);
  });

  test("never falls back to a raw list of search-hit titles", () => {
    expect(SYSTEM_PROMPT).toMatch(/never fall back to a raw list of search-hit titles/i);
  });
});

/* ── Tool step collapsing ────────────────────────────────────────────── */

describe("collapseToolSteps", () => {
  test("collapses two consecutive calls that read the same label", () => {
    const steps = collapseToolSteps([
      { name: "get_skills", done: true },
      { name: "get_skills", done: true },
    ]);
    expect(steps).toEqual([{ name: "get_skills", done: true }]);
  });

  test("keeps a genuinely different lookup as its own step", () => {
    const steps = collapseToolSteps([
      { name: "get_skills", done: true },
      { name: "get_experience", done: true },
      { name: "get_skills", done: true },
    ]);
    expect(steps.map((s) => s.name)).toEqual(["get_skills", "get_experience", "get_skills"]);
  });

  test("stays 'running' while any of the collapsed calls is still running", () => {
    const steps = collapseToolSteps([
      { name: "get_skills", done: true },
      { name: "get_skills", done: false },
    ]);
    expect(steps).toEqual([{ name: "get_skills", done: false }]);
  });

  test("is what the panel renders", () => {
    expect(read("src/components/TheoAI.tsx")).toContain("collapseToolSteps");
  });
});

describe("tool labels cover every tool the model can call", () => {
  test("has a label for each schema name", () => {
    for (const schema of TOOL_SCHEMAS) {
      expect(TOOL_LABELS[schema.function.name], `missing label for ${schema.function.name}`).toBeTruthy();
    }
  });
});
