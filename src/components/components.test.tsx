import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { AboutSection } from "./AboutSection";
import { ExperienceSection } from "./ExperienceSection";
import { ProjectsSection } from "./ProjectsSection";
import { WritingSection } from "./WritingSection";
import { ShimmerOverlay } from "./ShimmerOverlay";
import { Reveal } from "./Reveal";
import { act } from "react";

afterEach(() => {
  cleanup();
});

function mockMobileMatchMedia() {
  const original = window.matchMedia;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => ({
      matches: false,
      media: "(min-width: 721px)",
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

describe("SiteHeader", () => {
  test("renders brand monogram and nav anchors", () => {
    render(<SiteHeader brand="Theo Douwes" monogram="TD" />);
    expect(screen.getByText("TD")).toBeTruthy();
    expect(screen.getByText("Theo Douwes")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe(
      "#about",
    );
    expect(screen.getByRole("link", { name: "Skills" }).getAttribute("href")).toBe(
      "#skills",
    );
    expect(screen.getByRole("link", { name: "Work" }).getAttribute("href")).toBe(
      "#work",
    );
    expect(
      screen.getByRole("link", { name: "Projects" }).getAttribute("href"),
    ).toBe("#projects");
    expect(screen.getByRole("link", { name: "Connect" }).getAttribute("href")).toBe(
      "#connect",
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toBeTruthy();
  });

  test("toggles mobile menu open and closed", () => {
    const restore = mockMobileMatchMedia();
    try {
      render(<SiteHeader brand="Theo Douwes" monogram="TD" />);
      const toggle = screen.getByRole("button", { name: "Open menu" });

      fireEvent.click(toggle);
      expect(screen.getByRole("button", { name: "Close menu" })).toBeTruthy();
      expect(toggle.getAttribute("aria-expanded")).toBe("true");
      expect(document.querySelector(".nav-shell.is-open")).toBeTruthy();
      expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
      expect(screen.getByRole("button", { name: "Open menu" })).toBeTruthy();
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
      expect(document.querySelector(".nav-shell.is-open")).toBeNull();
    } finally {
      restore();
    }
  });

  test("closes mobile menu when a nav link is clicked", () => {
    const restore = mockMobileMatchMedia();
    try {
      render(<SiteHeader brand="Theo Douwes" monogram="TD" />);
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      fireEvent.click(screen.getByRole("link", { name: "Work" }));
      expect(screen.getByRole("button", { name: "Open menu" })).toBeTruthy();
      expect(document.querySelector(".nav-shell.is-open")).toBeNull();
    } finally {
      restore();
    }
  });

  test("closes mobile menu on Escape", () => {
    const restore = mockMobileMatchMedia();
    try {
      render(<SiteHeader brand="Theo Douwes" monogram="TD" />);
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(document.querySelector(".nav-shell.is-open")).toBeTruthy();
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.getByRole("button", { name: "Open menu" })).toBeTruthy();
      expect(document.querySelector(".nav-shell.is-open")).toBeNull();
    } finally {
      restore();
    }
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
        medium="https://medium.com/Douwes.theo"
        navigara="https://navigara.com"
        zeroCopy="https://tinyurl.com/video-live-bot"
        email="tadouwes@berkeley.edu"
        phone="+1-858-663-3556"
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
    expect(
      screen.getByRole("link", { name: "tadouwes@berkeley.edu" }).getAttribute(
        "href",
      ),
    ).toBe("mailto:tadouwes@berkeley.edu");
    expect(
      screen.getByRole("link", { name: "ZeroCopy demo" }).getAttribute("href"),
    ).toContain("tinyurl");
  });
});

describe("AboutSection", () => {
  test("renders stats and skills", () => {
    render(
      <AboutSection
        title="GTM and Sales Engineer"
        aboutTitle="Probabilistic systems for GTM, underwriting, and risk"
        location="SF"
        about={["Paragraph one about research."]}
        stats={[{ value: "$5.88M", label: "Acquisitions" }]}
        skills={["Python", "R"]}
        skillCategories={[
          { category: "Languages & tooling", items: ["Python", "R"] },
        ]}
      />,
    );
    expect(screen.getByText(/Probabilistic systems/i)).toBeTruthy();
    expect(screen.getByText("$5.88M")).toBeTruthy();
    expect(screen.getAllByText("Python").length).toBeGreaterThan(0);
    expect(screen.getByText("Languages & tooling")).toBeTruthy();
  });
});

describe("ExperienceSection", () => {
  test("lists roles and education", () => {
    render(
      <ExperienceSection
        workIntro="Documented chapters only."
        experience={[
          {
            id: "navigara",
            role: "GTM and Sales Engineer",
            org: "Navigara",
            location: "SF",
            start: "Feb 2026",
            end: "Present",
            highlights: ["Outreach automation.", "Playbooks."],
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
    expect(screen.getByText("GTM and Sales Engineer")).toBeTruthy();
    expect(screen.getAllByText(/Navigara/).length).toBeGreaterThan(0);
    expect(screen.getByText("Outreach automation.")).toBeTruthy();
    expect(screen.getByText("UC Berkeley")).toBeTruthy();
    expect(screen.getByText("STAT 198")).toBeTruthy();
    expect(containerOrDocHasBullets()).toBe(true);
    expect(document.querySelector(".experience-icon")).toBeTruthy();
    expect(document.querySelector(".timeline-number")?.textContent).toBe("01");
  });
});

function containerOrDocHasBullets(): boolean {
  return document.querySelectorAll(".bullet-list li").length > 0;
}

describe("ProjectsSection", () => {
  test("renders project links and static cards", () => {
    render(
      <ProjectsSection
        projects={[
          {
            id: "bayesian",
            title: "Bayesian Inference System",
            tag: "Sparse-data",
            href: "https://medium.com/Douwes.theo",
            blurb: "Bayesian methods.",
          },
          {
            id: "re-tool",
            title: "Real Estate Analysis Tool",
            tag: "R Shiny",
            href: null,
            blurb: "Interactive model.",
          },
        ]}
      />,
    );
    expect(
      screen
        .getByRole("link", { name: /Bayesian Inference System/i })
        .getAttribute("href"),
    ).toContain("medium.com");
    expect(screen.getByText("Real Estate Analysis Tool")).toBeTruthy();
    expect(document.querySelector(".link-item.is-static")).toBeTruthy();
  });
});

describe("WritingSection", () => {
  test("renders essay links", () => {
    render(
      <WritingSection
        writing={[
          {
            id: "bayes-medium",
            title: "Bayesian inference for sparse-data decisions",
            href: "https://medium.com/Douwes.theo",
            blurb: "Sparse-data notes.",
          },
        ]}
      />,
    );
    expect(
      screen
        .getByRole("link", { name: /Bayesian inference/i })
        .getAttribute("href"),
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

  test("supports semantic list-item reveals", () => {
    const { container } = render(
      <ol>
        <Reveal as="li">Timeline chapter</Reveal>
      </ol>,
    );
    expect(container.querySelector("ol > li.reveal")?.textContent).toBe(
      "Timeline chapter",
    );
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
