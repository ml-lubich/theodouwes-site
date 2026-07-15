import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { buildHomePageModel } from "@/lib/home-model";
import { profile } from "@/lib/profile";

mock.module("next/image", () => ({
  default: (props: { readonly src: string; readonly alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

mock.module("next/dynamic", () => ({
  default: () => () => <div data-testid="brain" />,
}));

afterEach(() => cleanup());

describe("home page composition", () => {
  test("wires model into header hero about and footer", async () => {
    const model = buildHomePageModel(profile);
    const { SiteHeader } = await import("@/components/SiteHeader");
    const { Hero } = await import("@/components/Hero");
    const { AboutSection } = await import("@/components/AboutSection");
    const { SiteFooter } = await import("@/components/SiteFooter");

    render(
      <>
        <SiteHeader brand={model.brand} monogram={model.monogram} />
        <Hero
          brand={model.brand}
          title={model.title}
          headline={model.headline}
          subhead={model.subhead}
          photoSrc={model.photoSrc}
          photoAlt={model.photoAlt}
          signals={model.signals}
          primaryCta={model.primaryCta}
          secondaryCta={model.secondaryCta}
        />
        <AboutSection
          about={model.about}
          location={model.location}
          title={model.title}
          stats={model.stats}
          skills={model.skills}
        />
        <SiteFooter
          name={model.brand}
          monogram={model.monogram}
          linkedin={profile.links.linkedin}
          github={profile.links.github}
          medium={profile.links.medium}
          navigara={profile.links.navigara}
        />
      </>,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /Theo\s*Douwes/,
    );
    expect(screen.getAllByText(model.stats[0]!.value).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Navigara" })).toBeTruthy();
  });
});
