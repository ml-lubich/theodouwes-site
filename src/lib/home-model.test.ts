import { describe, expect, test } from "bun:test";
import { buildHomePageModel } from "./home-model";
import { profile } from "./profile";

describe("buildHomePageModel unit", () => {
  test("maps photo monogram signals stats and tertiary CTA", () => {
    const model = buildHomePageModel(profile);
    expect(model.monogram).toBe("TD");
    expect(model.photoSrc).toBe("/theo.webp");
    expect(model.signals.length).toBeGreaterThan(0);
    expect(model.stats.length).toBeGreaterThan(0);
    expect(model.skills).toContain("Python");
    expect(model.skills).toContain("Bayesian inference");
    expect(model.skillCategories.length).toBeGreaterThan(5);
    expect(model.linkedin).toContain("linkedin.com");
    expect(model.github).toContain("github.com");
    expect(model.aboutTitle).toContain("Probabilistic");
    expect(model.tertiaryCta).toEqual({
      label: "Navigara",
      href: profile.links.navigara,
    });
  });

  test("preserves projects and writing collections", () => {
    const model = buildHomePageModel(profile);
    expect(model.projects.map((p) => p.id)).toEqual(
      profile.projects.map((p) => p.id),
    );
    expect(model.writing.map((w) => w.id)).toEqual(
      profile.writing.map((w) => w.id),
    );
  });
});
