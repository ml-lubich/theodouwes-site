import type { ProjectItem } from "@/lib/profile";
import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";

interface ProjectsSectionProps {
  readonly projects: readonly ProjectItem[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <Reveal as="section" className="section" id="projects" delayMs={100}>
      <p className="section-label">Projects</p>
      <h2 className="section-title" id="projects-title">
        Selected systems
      </h2>
      <ul className="link-grid">
        {projects.map((item) => (
          <li key={item.id}>
            {item.href ? (
              <a
                className="link-item glass-card"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ShimmerOverlay />
                <h3>{item.title}</h3>
                <span className="outlet">{item.tag}</span>
                <p className="link-blurb">{item.blurb}</p>
              </a>
            ) : (
              <div className="link-item glass-card is-static">
                <ShimmerOverlay />
                <h3>{item.title}</h3>
                <span className="outlet">{item.tag}</span>
                <p className="link-blurb">{item.blurb}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
