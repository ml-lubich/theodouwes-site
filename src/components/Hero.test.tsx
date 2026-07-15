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
          title="AI Transformation @ Navigara"
          headline="Quantifying developer productivity into business outcomes."
          subhead="Leaders need signal."
          photoSrc="/theo.webp"
          photoAlt="Portrait of Theo Alexander Douwes"
          signals={["Navigara", "ETV Research"]}
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
      screen.getByText(/Quantifying developer productivity/i),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "View work" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Theo Alexander Douwes/i })).toBeTruthy();
    expect(screen.getByText("Navigara")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("white-brain-mock")).toBeTruthy();
    });
  });
});
