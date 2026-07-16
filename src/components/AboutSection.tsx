import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";

interface AboutSectionProps {
  readonly title: string;
  readonly aboutTitle: string;
  readonly location: string;
  readonly about: readonly string[];
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly skills: readonly string[];
}

export function AboutSection({
  title,
  aboutTitle,
  location,
  about,
  stats,
  skills,
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
      <div className="skills" aria-label="Skills">
        <p className="section-label">Skills</p>
        <ul className="bullet-list skills-bullets">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
