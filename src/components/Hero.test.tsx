import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";

mock.module("next/image", () => ({
  default: (props: {
    readonly src: string;
    readonly alt: string;
    readonly width?: number;
    readonly height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} width={props.width} height={props.height} />
  ),
}));

mock.module("next/dynamic", () => ({
  default: () => () => <div data-testid="white-brain-mock" />,
}));

afterEach(() => cleanup());

describe("Hero", () => {
  test("renders brand headline CTAs signals and portrait", async () => {
    const { Hero } = await import("./Hero");
    await act(async () => {
      render(
        <Hero
          brand="Theo Douwes"
          title="GTM and Sales Engineer @ Navigara"
          headline="Statistics graduate building GTM systems, underwriting tools, and probabilistic decision software."
          subhead="Documented impact only."
          photoSrc="/theo.webp"
          photoAlt="Portrait of Theo Alexander Douwes"
          portraitMeta="San Francisco · Stats · GTM systems"
          signals={["Navigara", "UC Berkeley Stats"]}
          primaryCta={{ label: "View work", href: "#work" }}
          secondaryCta={{
            label: "Connect on LinkedIn",
            href: "https://www.linkedin.com/in/theo-douwes",
          }}
        />,
      );
    });

    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /Theo\s*Douwes/,
    );
    expect(
      screen.getByText(/Statistics graduate building GTM systems/i),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "View work" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Theo Alexander Douwes/i })).toBeTruthy();
    expect(screen.getByText("Navigara")).toBeTruthy();
    expect(screen.getByText(/San Francisco · Stats/i)).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("white-brain-mock")).toBeTruthy();
    });
  });

  test("renders single-token brand without splitting", async () => {
    const { Hero } = await import("./Hero");
    await act(async () => {
      render(
        <Hero
          brand="Theo"
          title="GTM"
          headline="Headline"
          subhead="Sub"
          photoSrc="/theo.webp"
          photoAlt="Portrait"
          portraitMeta="SF"
          signals={["Stats"]}
          primaryCta={{ label: "View work", href: "#work" }}
          secondaryCta={{
            label: "Connect on LinkedIn",
            href: "https://www.linkedin.com/in/theo-douwes",
          }}
        />,
      );
    });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/Theo/);
  });
});
