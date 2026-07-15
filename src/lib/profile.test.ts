import { describe, expect, test } from "bun:test";
import { formatTenure, getExperienceById, profile } from "./profile";

describe("profile domain", () => {
  test("includes Navigara as current role", () => {
    const navigara = getExperienceById("navigara");
    expect(navigara).toBeDefined();
    expect(navigara?.org).toBe("Navigara");
    expect(navigara?.end).toBe("Present");
  });

  test("formats tenure with an em dash", () => {
    expect(formatTenure("Apr 2026", "Present")).toBe("Apr 2026 — Present");
  });

  test("requires brand-facing identity fields", () => {
    expect(profile.shortName.length).toBeGreaterThan(0);
    expect(profile.headline.length).toBeGreaterThan(0);
    expect(profile.experience.length).toBeGreaterThan(0);
    expect(profile.featured.length).toBeGreaterThan(0);
    expect(profile.photoSrc).toBe("/theo.webp");
    expect(profile.monogram).toBe("TD");
  });

  test("returns undefined for unknown experience ids", () => {
    expect(getExperienceById("does-not-exist")).toBeUndefined();
  });

  test("exposes quant signal stats", () => {
    expect(profile.stats.length).toBeGreaterThanOrEqual(3);
    expect(profile.skills).toContain("AI Strategy");
  });
});
