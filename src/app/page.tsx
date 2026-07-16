import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { WritingSection } from "@/components/WritingSection";
import { ConnectLinks } from "@/components/ConnectLinks";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
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
        <ExperienceSection
          experience={model.experience}
          workIntro={model.workIntro}
          education={model.education}
        />
        <ProjectsSection projects={model.projects} />
        <WritingSection writing={model.writing} />
        <Reveal as="section" className="section" id="connect" delayMs={40}>
          <p className="section-label">Connect</p>
          <h2 className="section-title">Profiles, writing, and demos</h2>
          <p className="meta-line">
            LinkedIn · GitHub · Medium · ZeroCopy · Navigara · email · phone
          </p>
          <ConnectLinks
            linkedin={model.linkedin}
            github={model.github}
            medium={model.medium}
            navigara={model.navigara}
            zeroCopy={model.zeroCopy}
            email={model.email}
            phone={model.phone}
          />
        </Reveal>
      </main>
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
    </div>
  );
}
