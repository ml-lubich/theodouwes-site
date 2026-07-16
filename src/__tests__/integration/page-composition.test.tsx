import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { buildHomePageModel } from "@/lib/home-model";
import { profile } from "@/lib/profile";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/lib/theme";

mock.module("next/image", () => ({
  default: (props: { readonly src: string; readonly alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

mock.module("next/dynamic", () => ({
  default: () => () => <div data-testid="brain" />,
}));

afterEach(() => {
  cleanup();
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.removeAttribute("data-theme");
});

describe("home page composition", () => {
  test("wires model into header hero about and footer", async () => {
    const model = buildHomePageModel(profile);
    const { SiteHeader } = await import("@/components/SiteHeader");
    const { Hero } = await import("@/components/Hero");
    const { AboutSection } = await import("@/components/AboutSection");
    const { SiteFooter } = await import("@/components/SiteFooter");

    render(
      <ThemeProvider>
        <SiteHeader brand={model.brand} monogram={model.monogram} />
        <Hero
          brand={model.brand}
          title={model.title}
          headline={model.headline}
          subhead={model.subhead}
          photoSrc={model.photoSrc}
          photoAlt={model.photoAlt}
          portraitMeta={model.portraitMeta}
          signals={model.signals}
          primaryCta={model.primaryCta}
          secondaryCta={model.secondaryCta}
        />
        <AboutSection
          about={model.about}
          aboutTitle={model.aboutTitle}
          location={model.location}
          title={model.title}
          stats={model.stats}
          skills={model.skills}
          skillCategories={model.skillCategories}
        />
        <SiteFooter
          name={model.brand}
          monogram={model.monogram}
          linkedin={model.linkedin}
          github={model.github}
          medium={model.medium}
          navigara={model.navigara}
          zeroCopy={model.zeroCopy}
          email={model.email}
          phone={model.phone}
        />
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /Theo\s*Douwes/,
    );
    expect(screen.getAllByText(model.stats[0]!.value).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Navigara" })).toBeTruthy();
    expect(screen.getByText(profile.links.email)).toBeTruthy();
    expect(screen.getAllByText("Bayesian inference").length).toBeGreaterThan(0);
  });
});
