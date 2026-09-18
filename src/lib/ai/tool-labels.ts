/**
 * ─── Tool step display ────────────────────────────────────────────────
 *
 * What a visitor is shown while TheoAI works. Kept out of the panel
 * component so the collapsing rule below is testable without a DOM.
 *
 * Two lookups can still *read* identically — e.g. get_skills called once
 * with a category filter and once without — and two identical lines in a
 * row look like a stutter, not like work. Collapse the display, not the call.
 */

/** Human-readable labels for the tool names the model calls. */
export const TOOL_LABELS: Record<string, string> = {
  search_profile: "Searching the profile",
  get_experience: "Reading career history",
  get_education: "Checking education",
  get_projects: "Pulling up projects",
  get_writing: "Fetching writing",
  get_skills: "Checking skills",
  get_contact: "Fetching contact details",
  chart_skills_by_category: "Charting skills by category",
  chart_experience_timeline: "Charting career timeline",
};

export interface ToolStep {
  name: string;
  done: boolean;
}

/**
 * Merges runs of steps that render the same label into one row. A step is only
 * shown as finished once every call folded into it has come back, so the
 * spinner never settles while a lookup is still out.
 */
export function collapseToolSteps(steps: ToolStep[]): ToolStep[] {
  const out: ToolStep[] = [];
  for (const step of steps) {
    const prev = out[out.length - 1];
    const sameLabel = prev && (TOOL_LABELS[prev.name] ?? prev.name) === (TOOL_LABELS[step.name] ?? step.name);
    if (sameLabel) out[out.length - 1] = { ...prev, done: prev.done && step.done };
    else out.push({ ...step });
  }
  return out;
}
