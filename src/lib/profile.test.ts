import { describe, expect, test } from "bun:test";
import { formatDuration, formatTenure, getExperienceById, profile } from "./profile";

describe("profile domain", () => {
  test("includes Navigara as current GTM role", () => {
    const navigara = getExperienceById("navigara");
    expect(navigara).toBeDefined();
    expect(navigara?.org).toBe("Navigara");
    expect(navigara?.role).toBe("GTM and Sales Engineer");
    expect(navigara?.start).toBe("Feb 2026");
    expect(navigara?.end).toBe("Present");
  });

  test("formats tenure with an em dash", () => {
    expect(formatTenure("Feb 2026", "Present")).toBe("Feb 2026 — Present");
  });

  test("requires brand-facing identity fields", () => {
    expect(profile.shortName.length).toBeGreaterThan(0);
    expect(profile.headline.length).toBeGreaterThan(0);
    expect(profile.experience.length).toBe(3);
    expect(profile.projects.length).toBeGreaterThan(0);
    expect(profile.photoSrc).toBe("/theo.webp");
    expect(profile.monogram).toBe("TD");
    expect(profile.links.email).toBe("tadouwes@berkeley.edu");
    expect(profile.links.medium).toBe("https://medium.com/Douwes.theo");
  });

  test("returns undefined for unknown experience ids", () => {
    expect(getExperienceById("does-not-exist")).toBeUndefined();
  });

  test("exposes documented impact stats only", () => {
    expect(profile.stats.map((s) => s.value)).toEqual([
      "$5.88M",
      "$350K+",
      "400+",
      "200K+",
    ]);
    expect(profile.skills).toContain("Python");
    expect(profile.skills).toContain("Bayesian inference");
    expect(profile.skills).toContain("Quantitative Analyst");
    expect(profile.skills.length).toBeGreaterThan(40);
  });

  test("keeps Piedmont and independent practice chapters honest", () => {
    const piedmont = getExperienceById("piedmont");
    expect(piedmont?.org).toBe("Piedmont Realty LLC");
    expect(piedmont?.role).toBe("Quantitative Real Estate Analyst");
    expect(getExperienceById("independent")?.role).toBe("Quantitative Analyst");
  });
});

describe("formatDuration", () => {
  test("counts inclusive months and formats yr/mo", () => {
    expect(formatDuration("Jan 2024", "Sep 2024")).toBe("9 mo");
    expect(formatDuration("Nov 2021", "Dec 2023")).toBe("2 yr 2 mo");
    expect(formatDuration("Jan 2023", "Dec 2023")).toBe("1 yr");
  });

  test("resolves Present against the reference date", () => {
    expect(formatDuration("Feb 2026", "Present", new Date(2026, 6, 19))).toBe("6 mo");
  });

  test("returns empty string for unparseable input", () => {
    expect(formatDuration("sometime", "Present")).toBe("");
  });
});
