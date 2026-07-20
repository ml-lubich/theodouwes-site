import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { THEME_STORAGE_KEY } from "@/lib/theme";

afterEach(() => {
  cleanup();
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.removeAttribute("data-theme");
});

function Harness() {
  const { theme, brainColor, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="brain">{brainColor}</span>
      <button type="button" onClick={() => setTheme("light")}>
        set light
      </button>
      <button
        type="button"
        // Invalid value must be rejected by the isTheme guard.
        onClick={() => setTheme("chartreuse" as never)}
      >
        set invalid
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  test("setTheme applies a valid theme and persists it", () => {
    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("set light"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  test("setTheme ignores an invalid theme", () => {
    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("set light"));
    fireEvent.click(screen.getByText("set invalid"));
    // Still the last valid value.
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  test("exposes a brain color for the active theme", () => {
    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("brain").textContent).toMatch(/^#[0-9a-fA-F]{3,6}$/);
  });

  test("falls back gracefully when localStorage reads throw", () => {
    const original = window.localStorage.getItem;
    window.localStorage.getItem = mock(() => {
      throw new Error("blocked");
    });
    try {
      render(
        <ThemeProvider>
          <Harness />
        </ThemeProvider>,
      );
      // Mount must not throw; a theme is still resolved and applied.
      expect(["light", "dark"]).toContain(
        screen.getByTestId("theme").textContent,
      );
      expect(document.documentElement.getAttribute("data-theme")).toBeTruthy();
    } finally {
      window.localStorage.getItem = original;
    }
  });

  test("useTheme throws outside a provider", () => {
    function Orphan() {
      useTheme();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/within ThemeProvider/i);
  });
});
