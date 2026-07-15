import type { WritingItem } from "@/lib/profile";
import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";

interface WritingSectionProps {
  readonly writing: readonly WritingItem[];
}

export function WritingSection({ writing }: WritingSectionProps) {
  return (
    <Reveal as="section" className="section" id="writing" delayMs={120}>
      <p className="section-label">Writing</p>
      <h2 className="section-title" id="writing-title">
        Essays & frameworks
      </h2>
      <ul className="link-grid">
        {writing.map((item) => (
          <li key={item.id}>
            <a
              className="link-item glass-card"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShimmerOverlay />
              <h3>{item.title}</h3>
              <p className="link-blurb">{item.blurb}</p>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
