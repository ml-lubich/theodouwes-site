import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { TheoAIMermaid } from "./TheoAIMermaid";

afterEach(() => {
  cleanup();
  mock.restore();
});

describe("TheoAIMermaid", () => {
  test("renders the SVG mermaid produces for the source", async () => {
    mock.module("mermaid", () => ({
      default: {
        initialize: () => {},
        render: async () => ({ svg: "<svg data-testid=\"mermaid-svg\"></svg>" }),
      },
    }));

    const { container } = render(<TheoAIMermaid source="graph TD\n  A --> B" />);

    await waitFor(() => expect(container.querySelector("svg")).toBeTruthy());
    expect(container.querySelector(".theoai-mermaid-fallback")).toBeNull();
  });

  test("falls back to the raw source in a <pre> when mermaid fails to render", async () => {
    mock.module("mermaid", () => ({
      default: {
        initialize: () => {},
        render: async () => {
          throw new Error("bad diagram");
        },
      },
    }));

    render(<TheoAIMermaid source="graph TD\n  A --> B" />);

    await waitFor(() => expect(document.querySelector(".theoai-mermaid-fallback")).toBeTruthy());
    expect(document.querySelector(".theoai-mermaid-fallback")?.textContent).toContain("graph TD");
  });
});
