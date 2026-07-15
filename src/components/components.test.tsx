import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { AboutSection } from "./AboutSection";
import { ExperienceSection } from "./ExperienceSection";
import { FeaturedSection } from "./FeaturedSection";
import { WritingSection } from "./WritingSection";
import { ShimmerOverlay } from "./ShimmerOverlay";
import { Reveal } from "./Reveal";
import { act } from "react";

afterEach(() => {
  cleanup();
});

describe("SiteHeader", () => {
  test("renders brand monogram and nav anchors", () => {
    render(<SiteHeader brand="Theo Douwes" monogram="TD" />);
    expect(screen.getByText("TD")).toBeTruthy();
    expect(screen.getByText("Theo Douwes")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe(
      "#about",
    );
    expect(screen.getByRole("link", { name: "Work" }).getAttribute("href")).toBe(
      "#work",
    );
  });
});

describe("SiteFooter", () => {
  test("renders copyright and outbound links", () => {
    render(
      <SiteFooter
        name="Theo Douwes"
        monogram="TD"
        linkedin="https://linkedin.com/in/theo-douwes"
        github="https://github.com/TheoDouwes"
        medium="https://medium.com/"
        navigara="https://navigara.com"
      />,
    );
    expect(
      screen.getByText(new RegExp(`${new Date().getFullYear()}.*Theo Douwes`)),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "LinkedIn" }).getAttribute("href"),
    ).toContain("theo-douwes");
    expect(
      screen.getByRole("link", { name: "Navigara" }).getAttribute("href"),
    ).toContain("navigara");
    expect(
      screen.getByRole("link", { name: "GitHub" }).getAttribute("href"),
    ).toBe("https://github.com/TheoDouwes");
  });
});

describe("AboutSection", () => {
  test("renders stats and skills", () => {
    render(
      <AboutSection
        title="AI Transformation"
        location="SF"
        about={["Paragraph one about research."]}
        stats={[{ value: "116%", label: "Lift" }]}
        skills={["AI Strategy", "R"]}
      />,
    );
    expect(screen.getByText(/Signal from the codebase/i)).toBeTruthy();
    expect(screen.getByText("116%")).toBeTruthy();
    expect(screen.getByText("AI Strategy")).toBeTruthy();
  });
});

describe("ExperienceSection", () => {
  test("lists roles and education", () => {
    render(
      <ExperienceSection
        experience={[
          {
            id: "navigara",
            role: "Open-source Researcher",
            org: "Navigara",
            location: "SF",
            start: "Apr 2026",
            end: "Present",
            highlights: ["Quant metrics.", "Ship signal."],
          },
        ]}
        education={{
          school: "UC Berkeley",
          degree: "BA Statistics",
          period: "2019–2023",
          notes: ["STAT 198"],
        }}
      />,
    );
    expect(screen.getByText("Open-source Researcher")).toBeTruthy();
    expect(screen.getAllByText(/Navigara/).length).toBeGreaterThan(0);
    expect(screen.getByText("Quant metrics.")).toBeTruthy();
    expect(screen.getByText("UC Berkeley")).toBeTruthy();
    expect(screen.getByText("STAT 198")).toBeTruthy();
    expect(containerOrDocHasBullets()).toBe(true);
  });
});

function containerOrDocHasBullets(): boolean {
  return document.querySelectorAll(".bullet-list li").length > 0;
}

describe("FeaturedSection", () => {
  test("renders press links", () => {
    render(
      <FeaturedSection
        featured={[
          {
            id: "vb",
            title: "ETV study",
            outlet: "VentureBeat",
            href: "https://venturebeat.com/",
            blurb: "Commit data.",
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: /ETV study/i }).getAttribute("href"),
    ).toContain("venturebeat");
    expect(screen.getByText("VentureBeat")).toBeTruthy();
  });
});

describe("WritingSection", () => {
  test("renders essay links", () => {
    render(
      <WritingSection
        writing={[
          {
            id: "moat",
            title: "Stop Vibe-Coding",
            href: "https://medium.com/x",
            blurb: "Moat framework.",
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: /Stop Vibe-Coding/i }).getAttribute("href"),
    ).toContain("medium.com");
  });
});

describe("ShimmerOverlay", () => {
  test("renders decorative shimmer layer", () => {
    const { container } = render(<ShimmerOverlay />);
    expect(container.querySelector(".shimmer")).toBeTruthy();
  });
});

describe("Reveal", () => {
  test("marks section visible after intersection", async () => {
    const { container } = render(
      <Reveal as="section" id="about-reveal" delayMs={0}>
        <p>Revealed content</p>
      </Reveal>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    const el = container.querySelector("#about-reveal");
    expect(el?.getAttribute("data-reveal-visible")).toBe("true");
    expect(screen.getByText("Revealed content")).toBeTruthy();
  });

  test("supports div variant", () => {
    const { container } = render(
      <Reveal>
        <span>Inner</span>
      </Reveal>,
    );
    expect(container.querySelector(".reveal")).toBeTruthy();
  });

  test("skips animation when reduced motion is preferred", async () => {
    const original = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: () => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
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

    const { container } = render(
      <Reveal as="section" id="reduced">
        <p>Static</p>
      </Reveal>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.querySelector("#reduced")?.getAttribute("data-reveal-settled")).toBe(
      "true",
    );

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: original,
    });
  });
});
