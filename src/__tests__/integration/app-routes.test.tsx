import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";

mock.module("next/image", () => ({
  default: (props: { readonly src: string; readonly alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

mock.module("next/dynamic", () => ({
  default: () => () => <div data-testid="brain" />,
}));

mock.module("next/font/google", () => ({
  IBM_Plex_Sans: () => ({ variable: "--font-sans" }),
  IBM_Plex_Mono: () => ({ variable: "--font-mono" }),
}));

mock.module("next/og", () => ({
  ImageResponse: class {
    constructor(
      public readonly element: { props: { children: string } },
      public readonly init: unknown,
    ) {}
  },
}));

afterEach(() => cleanup());

describe("app routes", () => {
  test("HomePage renders brand and sections", async () => {
    const HomePage = (await import("@/app/page")).default;
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /Theo\s*Douwes/i,
    );
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(document.getElementById("about")).toBeTruthy();
    expect(document.getElementById("work")).toBeTruthy();
  });

  test("RootLayout wraps children", async () => {
    const RootLayout = (await import("@/app/layout")).default;
    const { container } = render(
      <RootLayout>
        <div>child-slot</div>
      </RootLayout>,
    );
    expect(container.textContent).toContain("child-slot");
  });

  test("Icon returns ImageResponse with TD", async () => {
    const Icon = (await import("@/app/icon")).default;
    const result = Icon() as { element: { props: { children: string } } };
    expect(result.element.props.children).toBe("TD");
  });
});
