import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";
import { SkillStorm } from "@/components/SkillStorm";
import type { SkillCategory } from "@/lib/skills";

interface AboutSectionProps {
  readonly title: string;
  readonly aboutTitle: string;
  readonly location: string;
  readonly about: readonly string[];
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly skills: readonly string[];
  readonly skillCategories: readonly SkillCategory[];
}

export function AboutSection({
  title,
  aboutTitle,
  location,
  about,
  stats,
  skills,
  skillCategories,
}: AboutSectionProps) {
  return (
    <Reveal as="section" className="section" id="about" delayMs={40}>
      <p className="section-label">About</p>
      <h2 className="section-title" id="about-title">
        {aboutTitle}
      </h2>
      <p className="meta-line">
        {title} · {location}
      </p>
      <div className="prose">
        {about.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      <div className="stats-strip">
        {stats.map((stat) => (
          <div className="stat glass-card" key={stat.label}>
            <ShimmerOverlay />
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="skills" id="skills">
        <p className="section-label">Skills</p>
        <h3 className="skills-heading">Keyword surface & probabilistic toolkit</h3>
        <p className="skills-lede">
          Role keywords plus documented languages, stats methods, underwriting, and
          GTM tooling. Items marked basics/concepts are adjacent skills — not
          multi-year production ownership claims.
        </p>

        <div className="skill-storm-wrap">
          <SkillStorm skills={skills} />
        </div>

        <div className="skills-catalog" aria-label="Skills by category">
          {skillCategories.map((group) => (
            <div className="skills-group" key={group.category}>
              <h4 className="skills-group-title">{group.category}</h4>
              <ul className="bullet-list skills-bullets">
                {group.items.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
