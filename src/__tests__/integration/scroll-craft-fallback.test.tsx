import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { WritingSection } from "@/components/WritingSection";
import { buildHomePageModel } from "@/lib/home-model";
import { profile } from "@/lib/profile";

/*
 * Regression: the SSR / compact / reduced-motion markup of every touched section
 * is byte-identical to what commit f4e632d rendered. Fixtures were generated from
 * f4e632d (GEN_FIXTURES=1 on that tree); they are frozen.
 */
const m = buildHomePageModel(profile);
const sections: Record<string, () => string> = {
  about: () =>
    renderToStaticMarkup(
      <AboutSection about={m.about} aboutTitle={m.aboutTitle} location={m.location} title={m.title} stats={m.stats} skills={m.skills} skillCategories={m.skillCategories} />,
    ),
  experience: () =>
    renderToStaticMarkup(<ExperienceSection experience={m.experience} workIntro={m.workIntro} education={m.education} />),
  projects: () => renderToStaticMarkup(<ProjectsSection projects={m.projects} />),
  writing: () => renderToStaticMarkup(<WritingSection writing={m.writing} />),
};

describe("scroll-craft SSR fallback equals f4e632d markup", () => {
  for (const [name, render] of Object.entries(sections)) {
    const file = join(process.cwd(), "src", "__tests__", "fixtures", `${name}.f4e632d.html`);
    test(name, () => {
      const html = render();
      if (process.env.GEN_FIXTURES === "1" && !existsSync(file)) writeFileSync(file, html);
      expect(readFileSync(file, "utf8")).toBe(html);
    });
  }
});
