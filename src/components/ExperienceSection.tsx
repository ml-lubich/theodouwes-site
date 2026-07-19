import type { ExperienceItem } from "@/lib/profile";
import { formatDuration, formatTenure } from "@/lib/profile";
import { AmbientField } from "@/components/AmbientField";
import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";
import { ExperienceIcon, HighlightIcon } from "@/components/ExperienceIcon";
import type { CSSProperties } from "react";

interface ExperienceSectionProps {
  readonly experience: readonly ExperienceItem[];
  readonly workIntro: string;
  readonly education: {
    readonly school: string;
    readonly degree: string;
    readonly period: string;
    readonly notes: readonly string[];
  };
}

export function ExperienceSection({
  experience,
  workIntro,
  education,
}: ExperienceSectionProps) {
  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <AmbientField seed={7} />
      <Reveal className="work-heading" delayMs={40} enable3D={false}>
        <p className="section-label">Work · Selected chapters</p>
        <h2 className="section-title kinetic-title" id="work-title">
          <span>Experience</span>
          <span className="kinetic-arrow" aria-hidden="true">↘</span>
        </h2>
        <p className="work-intro">{workIntro}</p>
      </Reveal>
      <ol className="timeline">
        {experience.map((item, index) => (
          <Reveal
            as="li"
            className="timeline-item glass-card"
            delayMs={70 + index * 85}
            enable3D={false}
            key={item.id}
          >
            <ShimmerOverlay />
            <div className="timeline-marker" aria-hidden="true">
              <span className="timeline-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="experience-icon-shell">
                <ExperienceIcon kind={item.id} className="experience-icon" />
              </span>
            </div>
            <div className="timeline-meta">
              <p className="tenure">{formatTenure(item.start, item.end)}</p>
              <p className="timeline-location">{item.location}</p>
              <p className="tenure-duration">{formatDuration(item.start, item.end)}</p>
              <span className="meta-watermark" aria-hidden="true">
                <ExperienceIcon kind={item.id} className="watermark-icon" />
              </span>
            </div>
            <div className="timeline-copy">
              <div className="timeline-role">
                <div className="role-line">
                  <h3 className="role"><span>{item.role}</span></h3>
                  <span className="card-arrow" aria-hidden="true">↗</span>
                </div>
                <p className="org">
                  {item.org}
                </p>
              </div>
              <ul className="bullet-list experience-highlights">
                {item.highlights.map((point, pointIndex) => (
                  <li key={point} style={{ "--point-index": pointIndex } as CSSProperties}>
                    <HighlightIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal className="edu-block glass-card" delayMs={120} enable3D={false}>
        <ShimmerOverlay />
        <div className="edu-icon-shell" aria-hidden="true">
          <ExperienceIcon kind="education" className="experience-icon" />
        </div>
        <div className="edu-copy">
          <p className="section-label">Education · Foundation</p>
          <div className="role-line">
            <h3 className="role"><span>{education.school}</span></h3>
            <span className="card-arrow" aria-hidden="true">↗</span>
          </div>
          <p className="org">
            {education.degree} · {education.period}
          </p>
          <ul className="bullet-list experience-highlights">
            {education.notes.map((note, pointIndex) => (
              <li key={note} style={{ "--point-index": pointIndex } as CSSProperties}>
                <HighlightIcon />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
