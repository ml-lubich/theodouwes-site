import type { ProjectItem } from "@/lib/profile";
import { AmbientField } from "@/components/AmbientField";
import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";

interface ProjectsSectionProps {
  readonly projects: readonly ProjectItem[];
}

function ProjectIcon({ kind }: { readonly kind: string }) {
  const path = {
    "gtm-system": <><circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="m8 11 8-4M8 13l8 4M18 8v8" /></>,
    bayesian: <><path d="M4 17c3-8 6-8 8 0s5 8 8 0" /><path d="M4 7c3 8 6 8 8 0s5-8 8 0" /></>,
    "re-tool": <><path d="M4 20V9l8-5 8 5v11M8 20v-5h8v5" /><path d="M7 10h2M11 10h2M15 10h2" /></>,
    zerocopy: <><path d="M3 17h18M5 14l4-5 3 3 5-7 2 4" /><circle cx="17" cy="5" r="1.5" /></>,
    tedx: <><path d="M7 20h10M9 20v-3h6v3M8 8a4 4 0 1 1 8 0c0 2-2 3-2 5h-4c0-2-2-3-2-5Z" /><path d="M5 5 3 4M19 5l2-1M12 1V0" /></>,
  }[kind];

  return (
    <svg className="project-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  );
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <Reveal as="section" className="section" id="projects" delayMs={100}>
      <AmbientField seed={11} />
      <p className="section-label">Projects · Working systems</p>
      <h2 className="section-title project-section-title" id="projects-title">
        Evidence over adjectives
      </h2>
      <p className="projects-lede">Models, workflows, and public artifacts grounded in Theo’s documented work.</p>
      <ul className="link-grid">
        {projects.map((item, index) => (
          <li key={item.id}>
            {item.href ? (
              <a
                className="link-item glass-card"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ShimmerOverlay />
                <div className="project-card-top">
                  <span className="project-icon-shell"><ProjectIcon kind={item.id} /></span>
                  <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p className="outlet">{item.tag}</p>
                <h3>{item.title}</h3>
                <p className="link-blurb">{item.blurb}</p>
                <ul className="project-methods" aria-label={`${item.title} methods`}>
                  {item.methods.map((method) => <li key={method}>{method}</li>)}
                </ul>
                <p className="project-artifact"><span>Deliverable</span>{item.artifact}</p>
                <span className="project-open" aria-hidden="true">Open ↗</span>
              </a>
            ) : (
              <div className="link-item glass-card is-static">
                <ShimmerOverlay />
                <div className="project-card-top">
                  <span className="project-icon-shell"><ProjectIcon kind={item.id} /></span>
                  <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p className="outlet">{item.tag}</p>
                <h3>{item.title}</h3>
                <p className="link-blurb">{item.blurb}</p>
                <ul className="project-methods" aria-label={`${item.title} methods`}>
                  {item.methods.map((method) => <li key={method}>{method}</li>)}
                </ul>
                <p className="project-artifact"><span>Deliverable</span>{item.artifact}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
