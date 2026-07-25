import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";

afterEach(() => cleanup());

function mockReducedMotion(matches: boolean) {
  const original = window.matchMedia;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }),
  });
  return () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: original,
    });
  };
}

describe("RoleRotator", () => {
  test("shows the first role immediately and cycles to the next", async () => {
    const { RoleRotator } = await import("./RoleRotator");
    await act(async () => {
      render(<RoleRotator roles={["Role One", "Role Two"]} intervalMs={20} />);
    });

    expect(screen.getAllByText("Role One").length).toBeGreaterThan(0);

    await waitFor(
      () => {
        expect(screen.getAllByText("Role Two").length).toBeGreaterThan(0);
      },
      { timeout: 2000 },
    );
  });

  test("does not cycle with a single role", async () => {
    const { RoleRotator } = await import("./RoleRotator");
    await act(async () => {
      render(<RoleRotator roles={["Only Role"]} intervalMs={20} />);
    });

    expect(screen.getAllByText("Only Role").length).toBeGreaterThan(0);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(screen.getAllByText("Only Role").length).toBeGreaterThan(0);
  });

  test("renders a static role and does not cycle under reduced motion", async () => {
    const restore = mockReducedMotion(true);
    try {
      const { RoleRotator } = await import("./RoleRotator");
      await act(async () => {
        render(<RoleRotator roles={["Role One", "Role Two"]} intervalMs={20} />);
      });

      expect(screen.getByText("Role One")).toBeTruthy();
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(screen.getByText("Role One")).toBeTruthy();
      expect(screen.queryByText("Role Two")).toBeNull();
    } finally {
      restore();
    }
  });
});
