import { describe, expect, test } from "bun:test";
import {
  flattenSkills,
  getSkillCategory,
  skillCategories,
} from "./skills";

describe("skills bank", () => {
  test("exposes categorized SEO-friendly inventory", () => {
    expect(skillCategories.length).toBeGreaterThanOrEqual(8);
    expect(flattenSkills()).toContain("Python");
    expect(flattenSkills()).toContain("Data Scientist");
    expect(flattenSkills()).toContain("R Shiny");
    expect(getSkillCategory("Python")).toBe("Languages & tooling");
  });

  test("does not invent heavy production stacks Theo did not claim", () => {
    const all = flattenSkills().join(" | ").toLowerCase();
    expect(all).not.toContain("kubernetes");
    expect(all).not.toContain("spring boot");
    expect(all).not.toContain("pytorch");
  });
});
