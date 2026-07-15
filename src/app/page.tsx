import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { FeaturedSection } from "@/components/FeaturedSection";
import { WritingSection } from "@/components/WritingSection";
import { SiteFooter } from "@/components/SiteFooter";
import { buildHomePageModel } from "@/lib/home-model";
import { profile } from "@/lib/profile";

export default function HomePage() {
  const model = buildHomePageModel(profile);

  return (
    <div className="site-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader brand={model.brand} monogram={model.monogram} />
      <main id="main">
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
        <ExperienceSection
          experience={model.experience}
          education={model.education}
        />
        <FeaturedSection featured={model.featured} />
        <WritingSection writing={model.writing} />
      </main>
      <SiteFooter
        name={model.brand}
        monogram={model.monogram}
        linkedin={profile.links.linkedin}
        github={profile.links.github}
        medium={profile.links.medium}
        navigara={profile.links.navigara}
      />
    </div>
  );
}
