import { describe, expect, test } from "bun:test";
import {
  brainColorForTheme,
  isTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  toggleTheme,
} from "./theme";

describe("theme domain", () => {
  test("validates theme strings", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("light")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  test("prefers stored theme over system preference", () => {
    expect(
      resolveInitialTheme({ stored: "light", prefersLight: false }),
    ).toBe("light");
    expect(
      resolveInitialTheme({ stored: "dark", prefersLight: true }),
    ).toBe("dark");
  });

  test("falls back to system preference then dark", () => {
    expect(
      resolveInitialTheme({ stored: null, prefersLight: true }),
    ).toBe("light");
    expect(
      resolveInitialTheme({ stored: "nope", prefersLight: false }),
    ).toBe("dark");
  });

  test("toggles between dark and light", () => {
    expect(toggleTheme("dark")).toBe("light");
    expect(toggleTheme("light")).toBe("dark");
  });

  test("brain is white in dark mode and black in light mode", () => {
    expect(brainColorForTheme("dark")).toBe("#ffffff");
    expect(brainColorForTheme("light")).toBe("#000000");
  });

  test("uses a stable localStorage key", () => {
    expect(THEME_STORAGE_KEY).toBe("theo-theme");
  });
});
