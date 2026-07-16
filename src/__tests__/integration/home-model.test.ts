import { describe, expect, test } from "bun:test";
import { buildHomePageModel } from "../../lib/home-model";
import { profile } from "../../lib/profile";

describe("home page model integration", () => {
  test("maps profile into a renderable home model", () => {
    const model = buildHomePageModel(profile);

    expect(model.brand).toBe(profile.shortName);
    expect(model.headline).toBe(profile.headline);
    expect(model.photoSrc).toBe("/theo.webp");
    expect(model.monogram).toBe("TD");
    expect(model.experience).toEqual(profile.experience);
    expect(model.projects).toHaveLength(profile.projects.length);
    expect(model.writing).toHaveLength(profile.writing.length);
  });

  test("wires CTAs to work section and LinkedIn", () => {
    const model = buildHomePageModel(profile);

    expect(model.primaryCta).toEqual({
      label: "View work",
      href: "#work",
    });
    expect(model.secondaryCta.href).toBe(profile.links.linkedin);
    expect(model.secondaryCta.label).toContain("LinkedIn");
    expect(model.tertiaryCta.href).toBe(profile.links.navigara);
  });

  test("preserves education notes for the work section", () => {
    const model = buildHomePageModel(profile);
    expect(model.education.school).toContain("Berkeley");
    expect(model.education.notes.length).toBeGreaterThan(0);
    expect(model.education.notes.some((n) => n.includes("400+"))).toBe(true);
  });
});
