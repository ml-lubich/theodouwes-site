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
    expect(model.skills).toContain("AI Strategy");
    expect(model.tertiaryCta).toEqual({
      label: "Navigara",
      href: profile.links.navigara,
    });
  });

  test("preserves featured and writing collections", () => {
    const model = buildHomePageModel(profile);
    expect(model.featured.map((f) => f.id)).toEqual(
      profile.featured.map((f) => f.id),
    );
    expect(model.writing.map((w) => w.id)).toEqual(
      profile.writing.map((w) => w.id),
    );
  });
});
