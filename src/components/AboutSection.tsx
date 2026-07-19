import { AmbientField } from "@/components/AmbientField";
import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";
import { getCategoryIcon, getSkillIcon } from "@/components/SkillIcons";
import { SkillStorm } from "@/components/SkillStorm";
import type { SkillCategory } from "@/lib/skills";

/* Display order tuned so the masonry columns of the catalog end at roughly
   the same height (card heights estimated from item counts) instead of one
   column running long. Categories missing from this list keep source order. */
const CATALOG_DISPLAY_ORDER = [
  "Roles & focus",
  "Python data / ML",
  "Languages & tooling",
  "Cloud, automation & ops",
  "Quant / stats methods",
  "LLM / AI engineering",
  "Domains",
  "Markets / risk / underwriting",
  "Data apps / full-stack lite",
  "Testing & analytical rigor",
];

function catalogRank(category: string): number {
  const rank = CATALOG_DISPLAY_ORDER.indexOf(category);
  return rank === -1 ? CATALOG_DISPLAY_ORDER.length : rank;
}

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
      <AmbientField seed={3} />
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
      <ol className="capability-grid" aria-label="How Theo works">
        <li className="capability-item">
          <span className="capability-number">01</span>
          <h3>Quantify uncertainty</h3>
          <p>State assumptions, model sensitivity, and make downside visible.</p>
        </li>
        <li className="capability-item">
          <span className="capability-number">02</span>
          <h3>Build the workflow</h3>
          <p>Turn analysis into usable models, automation, and decision tools.</p>
        </li>
        <li className="capability-item">
          <span className="capability-number">03</span>
          <h3>Make it operable</h3>
          <p>Document the system, clarify handoffs, and communicate in plain language.</p>
        </li>
      </ol>
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
        <h3 className="skills-heading">Quantitative, analytical & engineering toolkit</h3>
        <p className="skills-lede">
          Statistical methods, testing discipline, underwriting, analytics, and GTM
          tooling. Basics/concepts labels mark working adjacency, not years of
          production ownership.
        </p>

        <div className="skill-storm-wrap">
          <SkillStorm skills={skills} />
        </div>

        <div className="skills-catalog" aria-label="Skills by category">
          {[...skillCategories]
            .sort((a, b) => catalogRank(a.category) - catalogRank(b.category))
            .map((group) => (
            <div className="skills-group glass-card" key={group.category}>
              <ShimmerOverlay />
              <h4 className="skills-group-title">
                <span className="skills-group-icon">{getCategoryIcon(group.category)}</span>
                {group.category}
                <span className="skills-group-count">{group.items.length}</span>
              </h4>
              <ul className="skill-tag-wrap">
                {group.items.map((skill) => (
                  <li className="skill-tag" key={skill}>
                    {getSkillIcon(skill)}
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
