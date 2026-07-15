import type { ExperienceItem } from "@/lib/profile";
import { formatTenure } from "@/lib/profile";
import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";

interface ExperienceSectionProps {
  readonly experience: readonly ExperienceItem[];
  readonly education: {
    readonly school: string;
    readonly degree: string;
    readonly period: string;
    readonly notes: readonly string[];
  };
}

export function ExperienceSection({
  experience,
  education,
}: ExperienceSectionProps) {
  return (
    <Reveal as="section" className="section" id="work" delayMs={80}>
      <p className="section-label">Work</p>
      <h2 className="section-title" id="work-title">
        Experience
      </h2>
      <ol className="timeline">
        {experience.map((item) => (
          <li className="timeline-item glass-card" key={item.id}>
            <ShimmerOverlay />
            <p className="tenure">{formatTenure(item.start, item.end)}</p>
            <div>
              <h3 className="role">{item.role}</h3>
              <p className="org">
                {item.org} · {item.location}
              </p>
              <ul className="bullet-list">
                {item.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="edu-block glass-card">
        <ShimmerOverlay />
        <p className="section-label">Education</p>
        <h3 className="role">{education.school}</h3>
        <p className="org">
          {education.degree} · {education.period}
        </p>
        <ul className="bullet-list">
          {education.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
