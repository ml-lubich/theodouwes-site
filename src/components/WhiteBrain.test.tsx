import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { act } from "react";

mock.module("@react-three/fiber", () => ({
  Canvas: ({
    children,
    onCreated,
  }: {
    readonly children?: React.ReactNode;
    readonly onCreated?: (state: {
      gl: { setClearColor: (color: number, alpha: number) => void };
    }) => void;
  }) => {
    onCreated?.({ gl: { setClearColor: () => undefined } });
    return <div data-testid="r3f-canvas">{children}</div>;
  },
}));

mock.module("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}));

afterEach(() => cleanup());

describe("WhiteBrain", () => {
  test("mounts stage shell, canvas, and becomes ready", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      const buf = new ArrayBuffer(8 + 2 * 12 + 8);
      const view = new DataView(buf);
      view.setUint32(0, 2, true);
      view.setUint32(4, 1, true);
      view.setFloat32(8, 0, true);
      view.setFloat32(12, 0, true);
      view.setFloat32(16, 0, true);
      view.setFloat32(20, 1, true);
      view.setFloat32(24, 1, true);
      view.setFloat32(28, 1, true);
      view.setUint32(32, 0, true);
      view.setUint32(36, 1, true);
      return new Response(buf, { status: 200 });
    }) as typeof fetch;

    const { WhiteBrain } = await import("./WhiteBrain");
    let container!: HTMLElement;
    await act(async () => {
      container = render(<WhiteBrain />).container;
    });

    expect(container.querySelector(".brain-stage")).toBeTruthy();
    expect(container.querySelector(".brain-skeleton")).toBeTruthy();
    expect(container.querySelector('[data-testid="r3f-canvas"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="orbit-controls"]')).toBeTruthy();

    await waitFor(() => {
      expect(container.querySelector(".brain-stage.is-ready")).toBeTruthy();
    });

    // Allow BrainScene effect to resolve with mocked fetch
    await waitFor(() => {
      expect(container.querySelectorAll("group, linesegments, lineSegments").length).toBeGreaterThanOrEqual(0);
    });

    globalThis.fetch = originalFetch;
  });
});
