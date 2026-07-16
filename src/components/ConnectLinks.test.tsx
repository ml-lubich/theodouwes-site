import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { ConnectLinks } from "./ConnectLinks";

afterEach(() => cleanup());

describe("ConnectLinks", () => {
  test("exposes LinkedIn GitHub Medium and contact anchors", () => {
    render(
      <ConnectLinks
        linkedin="https://www.linkedin.com/in/theo-douwes"
        github="https://github.com/TheoDouwes"
        medium="https://medium.com/Douwes.theo"
        navigara="https://navigara.com"
        zeroCopy="https://tinyurl.com/video-live-bot"
        email="tadouwes@berkeley.edu"
        phone="+1-858-663-3556"
      />,
    );

    expect(screen.getByRole("link", { name: /LinkedIn/i }).getAttribute("href")).toBe(
      "https://www.linkedin.com/in/theo-douwes",
    );
    expect(screen.getByRole("link", { name: /GitHub/i }).getAttribute("href")).toBe(
      "https://github.com/TheoDouwes",
    );
    expect(screen.getByRole("link", { name: /Medium/i }).getAttribute("href")).toBe(
      "https://medium.com/Douwes.theo",
    );
    expect(screen.getByRole("link", { name: /Email/i }).getAttribute("href")).toBe(
      "mailto:tadouwes@berkeley.edu",
    );
  });
});
