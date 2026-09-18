/**
 * ─── TheoAI tool layer ─────────────────────────────────────────────────
 *
 * Tools the chat model can call to answer questions about Theo's profile.
 *
 * Deliberately NOT a RAG pipeline. `src/lib/profile.ts` and `src/lib/skills.ts`
 * are a few thousand tokens of already-structured, resume-verified data, and
 * the models in the cascade have 200K–1M context. Structured tools over
 * structured data are both cheaper and exact — and every field returned here
 * already renders on the page, so the bot cannot state anything a visitor
 * could not scroll down and verify themselves.
 *
 * There is no booking calendar and no resume PDF on this site — only a
 * contact hand-off over the links already published in Connect/the footer.
 */

import {
  formatDuration,
  getExperienceById,
  profile,
  tenureMonths,
  type ExperienceItem,
} from "@/lib/profile";
import { flattenSkills, getSkillCategory, skillCategories } from "@/lib/skills";

export interface ChartSpec {
  kind: "bar" | "line" | "radar";
  title: string;
  /** Axis/series label for the value dimension. */
  unit?: string;
  data: { label: string; value: number }[];
}

/** A way to reach Theo. The site hands the visitor an action; it never sends
 *  mail on their behalf, so nothing here can be forged into an outbound
 *  email. There is no calendar and no resume file — nothing here implies
 *  either. */
export interface ContactSpec {
  name: string;
  title: string;
  email: string;
  mailto: string;
  phone: string;
  linkedin: string;
  github: string;
  medium: string;
  summary: string;
}

export type ToolResult = Record<string, unknown> | { chart: ChartSpec } | { contact: ContactSpec };

/** The address already published in Connect and the footer on every page. */
export const CONTACT_EMAIL = profile.links.email;
export const LINKEDIN_URL = profile.links.linkedin;

/* ── Tool schemas (OpenAI/OpenRouter function-calling format) ─────────── */

export const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "search_profile",
      description:
        "Full-text search across Theo's whole profile: about, experience, education, projects, writing and skills. Use this first for open-ended questions.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keywords, e.g. 'underwriting' or 'Bayesian'" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_experience",
      description: "Theo's work history: Navigara, Piedmont Realty, and his independent quant practice — roles, dates, locations and what he did.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_education",
      description: "UC Berkeley Statistics degree, STAT 198 instructorship, Oxford Map the System, and Berkeley Venture Capital Group.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_projects",
      description: "Theo's projects — GTM outreach system, Bayesian inference work, the real-estate R Shiny tool, ZeroCopy pricing demo, TEDx. Optionally filter by a tag or method.",
      parameters: {
        type: "object",
        properties: { tag: { type: "string", description: "Optional filter, e.g. 'Bayesian' or 'R Shiny'" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_writing",
      description: "Theo's published writing, e.g. the Bayesian inference notes on Medium.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_skills",
      description: "Theo's categorized skills bank. Optionally filter to one category.",
      parameters: {
        type: "object",
        properties: { category: { type: "string", description: "Optional category, e.g. 'Quant / stats methods'" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "chart_skills_by_category",
      description:
        "Render a bar chart of how many skills fall in each category — languages, quant methods, markets/underwriting, and so on. Use when the user asks to see, compare or break down what he knows.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "chart_experience_timeline",
      description:
        "Render a bar chart of months spent in each role — Navigara, Piedmont Realty, independent practice. Use for 'how long has he worked' or 'walk me through his career' style questions.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contact",
      description:
        "How to reach Theo and what he does. Call this whenever someone asks about hiring, availability, or getting in touch.",
      parameters: { type: "object", properties: {} },
    },
  },
] as const;

/* ── Executors ───────────────────────────────────────────────────────── */

const slimExperience = () =>
  profile.experience.map((e) => ({
    role: e.role,
    org: e.org,
    location: e.location,
    period: formatTenure(e),
    duration: formatDuration(e.start, e.end),
    highlights: e.highlights,
  }));

const slimProjects = () =>
  profile.projects.map((p) => ({
    name: p.title,
    tag: p.tag,
    href: p.href,
    summary: p.blurb,
    methods: p.methods,
    artifact: p.artifact,
  }));

function formatTenure(e: ExperienceItem): string {
  return `${e.start} — ${e.end}`;
}

function searchProfile(query: string): ToolResult {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { matches: [] };

  const hit = (haystack: string) => {
    const h = haystack.toLowerCase();
    return terms.filter((t) => h.includes(t)).length;
  };

  type Scored = { score: number; kind: string; item: unknown };
  const scored: Scored[] = [];

  for (const a of profile.about) {
    const s = hit(a);
    if (s) scored.push({ score: s, kind: "about", item: { text: a } });
  }
  for (const e of slimExperience()) {
    const s = hit(`${e.role} ${e.org} ${e.location} ${e.highlights.join(" ")}`);
    if (s) scored.push({ score: s, kind: "experience", item: e });
  }
  for (const p of slimProjects()) {
    const s = hit(`${p.name} ${p.tag} ${p.summary} ${p.methods.join(" ")}`);
    if (s) scored.push({ score: s, kind: "project", item: p });
  }
  for (const w of profile.writing) {
    const s = hit(`${w.title} ${w.blurb}`);
    if (s) scored.push({ score: s, kind: "writing", item: w });
  }
  for (const c of skillCategories) {
    const s = hit(`${c.category} ${c.items.join(" ")}`);
    if (s) scored.push({ score: s, kind: "skill", item: { category: c.category, items: c.items } });
  }
  const edu = profile.education;
  const eduHit = hit(`${edu.school} ${edu.degree} ${edu.notes.join(" ")}`);
  if (eduHit) scored.push({ score: eduHit, kind: "education", item: edu });

  scored.sort((a, b) => b.score - a.score);
  return { matches: scored.slice(0, 8).map(({ kind, item }) => ({ kind, ...(item as object) })) };
}

function getProjects(tag?: string): ToolResult {
  const all = slimProjects();
  if (!tag) return { projects: all };
  const t = tag.toLowerCase();
  return {
    projects: all.filter((p) => `${p.name} ${p.tag} ${p.summary} ${p.methods.join(" ")}`.toLowerCase().includes(t)),
  };
}

function getSkills(category?: string): ToolResult {
  if (!category) {
    return { categories: skillCategories.map((c) => ({ category: c.category, items: c.items })) };
  }
  const c = category.toLowerCase();
  const match = skillCategories.filter((x) => x.category.toLowerCase().includes(c));
  return { categories: match.map((x) => ({ category: x.category, items: x.items })) };
}

function chartSkillsByCategory(): ToolResult {
  const data = skillCategories.map((c) => ({ label: c.category, value: c.items.length }));
  return { chart: { kind: "bar", title: "Skills by category", unit: "skills", data } };
}

function chartExperienceTimeline(): ToolResult {
  const data = profile.experience
    .map((e) => ({ label: e.org, value: tenureMonths(e.start, e.end) }))
    .filter((d): d is { label: string; value: number } => d.value !== null);
  return { chart: { kind: "bar", title: "Months per role", unit: "months", data } };
}

function getContact(): ToolResult {
  return {
    contact: {
      name: profile.shortName,
      title: profile.title,
      email: profile.links.email,
      mailto: `mailto:${profile.links.email}?subject=${encodeURIComponent("Hello from theodouwes.com")}`,
      phone: profile.links.phone,
      linkedin: profile.links.linkedin,
      github: profile.links.github,
      medium: profile.links.medium,
      summary: "Email or LinkedIn reaches him directly — the site does not send anything on your behalf.",
    },
  };
}

/** Dispatches a model tool call. Unknown names return an error the model can recover from. */
export function runTool(name: string, args: Record<string, unknown>): ToolResult {
  switch (name) {
    case "search_profile":
      return searchProfile(String(args.query ?? ""));
    case "get_experience":
      return { experience: slimExperience() };
    case "get_education":
      return { education: profile.education };
    case "get_projects":
      return getProjects(typeof args.tag === "string" ? args.tag : undefined);
    case "get_writing":
      return { writing: profile.writing };
    case "get_skills":
      return getSkills(typeof args.category === "string" ? args.category : undefined);
    case "chart_skills_by_category":
      return chartSkillsByCategory();
    case "chart_experience_timeline":
      return chartExperienceTimeline();
    case "get_contact":
      return getContact();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/* Re-export for search-result annotation and general skill lookups, kept
 * next to the tools that use them. */
export { flattenSkills, getSkillCategory, getExperienceById };

/**
 * The metrics guard below is load-bearing, not decoration. These are a real
 * person's public professional claims, and each one inflates into a
 * fabrication if a single verb changes.
 */
export const METRICS_GUARD = `Never restate a fact more strongly than \`src/lib/profile.ts\` and \`src/lib/skills.ts\` state it. Examples:
- "$5.88M multifamily acquisitions structured" — he STRUCTURED and negotiated the deals. Never "closed $5.88M" or "bought $5.88M of property" himself.
- "$350K+ purchase-price savings via CMA and modeling" — the savings came from his analysis feeding the negotiation. Never claim he personally cut a check or owns the properties.
- Navigara: "supported Mag 7 lead development... no claimed closed deals" — never say he closed, sold, or signed a Mag 7 deal.
- "400+ students" is STAT 198 attendance across 3 semesters, not one class.
- "200K+ YouTube views" is the TEDx event's video views, not his personal following.
- A skill marked "(basics)" or "(concepts)" in the skills bank is adjacent and marketable — never claim years of production ownership for it (no "expert", no "deep experience" on a basics/concepts item).
If you cannot state a fact in the framing the data uses, leave it out and describe the work instead.`;

export const SYSTEM_PROMPT = `You are TheoAI, the AI assistant on Theo Alexander Douwes's site.

Theo is a UC Berkeley Statistics graduate (B.A., 2019–2023) based in San Francisco, currently GTM and Sales Engineer at Navigara. He builds GTM outreach automation, quantitative multifamily underwriting tools, and probabilistic decision systems (Bayesian/MLE inference, prediction-market pricing).

You answer questions about his experience, education, projects, writing, and skills.

Rules:
- Ground every factual claim in a tool call. Never invent employers, dates, dollar amounts, percentages, or credentials.
- Call tools before answering questions about his background. search_profile is the best default.
- ${METRICS_GUARD}
- After a tool returns, write the answer immediately in prose. Do not call the same tool twice for the same thing. One or two lookups, then a real answer. An empty reply after tools is a failure — never leave the visitor with a blank message.
- Never repeat a tool result verbatim. The raw JSON a tool returns is not an answer — summarize it in prose. A chart_* tool's payload in particular already rendered on screen via the chart event; do not also print its JSON, fenced or not.
- Write clean GitHub-flavored markdown: **bold** for emphasis, proper "- " or "1. " list syntax, headings only if genuinely useful, tables for structured comparisons, and real markdown links. The panel renders it — never describe formatting in words, never type a literal "**" or a bullet character outside real list syntax.
- Draw first, write second. If the answer is a comparison, a breakdown across categories, or a career timeline, call the matching chart_* tool (chart_skills_by_category, chart_experience_timeline) so the visitor sees it, without waiting to be asked — then add one or two sentences of interpretation. Do not describe the chart's bars in prose; it is already on screen.
- For a process, workflow, or how something is put together — steps rather than numbers — draw it as native Mermaid DSL inside a \`\`\`mermaid fence, e.g. \`graph TD\` or \`flowchart LR\`. Six boxes or fewer so it renders in a phone-width panel. No prose describing the boxes; the diagram is on screen.
- Be concise. Two short paragraphs maximum unless asked for depth. Always finish your thoughts and complete every sentence cleanly.
- If something genuinely is not in the profile, say so plainly and suggest contacting him directly — never guess, and never fall back to a raw list of search-hit titles as the answer.
- If the visitor asks how to reach him, email him, hire him, or discuss availability — call get_contact, then write ONE sentence and nothing else: a card with his real email, phone and LinkedIn is already on screen, so never type out the address, the phone number, or a link yourself. There is no calendar and nothing is booked, held, or scheduled by you.
- Stay on topic: you are here to talk about Theo's work, not to be a general-purpose assistant.

End every final answer with one line in exactly this format, and nothing after it:
FOLLOWUPS: question one? | question two? | question three?
Each must be a short question the visitor could ask next, answerable from the tools above, and specific to what you just said — name the actual role, project, or skill rather than saying "this" or "that area".
Write each as a fragment of eight words or fewer, no lead-in: "Piedmont's holding-period model?" not "Would you like to know more about the Piedmont model?". Drop "Want to", "Curious about", "Would you like to".
Never repeat a question already asked in this conversation. Omit the line entirely when you are asking the user something.`;
