import { describe, expect, test } from "bun:test";
import {
  brainColorForTheme,
  isTheme,
  resolveInitialTheme,
  parsePref,
  resolveTheme,
  THEME_STORAGE_KEY,
  themeBootScript,
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

  test("parsePref treats anything unrecognised as system", () => {
    expect(parsePref("light")).toBe("light");
    expect(parsePref("dark")).toBe("dark");
    expect(parsePref("system")).toBe("system");
    expect(parsePref(null)).toBe("system");
    expect(parsePref("<script>")).toBe("system");
  });

  test("resolveTheme follows the system only for the system pref", () => {
    expect(resolveTheme("system", true)).toBe("light");
    expect(resolveTheme("system", false)).toBe("dark");
    expect(resolveTheme("dark", true)).toBe("dark");
    expect(resolveTheme("light", false)).toBe("light");
  });

  test("boot script resolves like resolveTheme (stored, system, throwing storage)", () => {
    const run = (stored: string | null, prefersLight: boolean, throws = false) => {
      const html = { style: {} as Record<string, string>, attrs: {} as Record<string, string>, setAttribute(k: string, v: string) { this.attrs[k] = v; } };
      const fn = new Function("document", "localStorage", "matchMedia", themeBootScript);
      fn(
        { documentElement: html },
        { getItem: () => { if (throws) throw new Error("blocked"); return stored; } },
        () => ({ matches: prefersLight }),
      );
      return [html.attrs["data-theme"], html.style.colorScheme];
    };
    expect(run("dark", true)).toEqual(["dark", "dark"]);
    expect(run("light", false)).toEqual(["light", "light"]);
    expect(run(null, true)).toEqual(["light", "light"]);
    expect(run(null, false)).toEqual(["dark", "dark"]);
    expect(run("junk", true)).toEqual(["light", "light"]);
    expect(run(null, true, true)).toEqual(["light", "light"]);
  });
});
