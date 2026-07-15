import type { FeaturedItem } from "@/lib/profile";
import { Reveal } from "@/components/Reveal";
import { ShimmerOverlay } from "@/components/ShimmerOverlay";

interface FeaturedSectionProps {
  readonly featured: readonly FeaturedItem[];
}

export function FeaturedSection({ featured }: FeaturedSectionProps) {
  return (
    <Reveal as="section" className="section" id="featured" delayMs={100}>
      <p className="section-label">Press</p>
      <h2 className="section-title" id="featured-title">
        In the field
      </h2>
      <ul className="link-grid">
        {featured.map((item) => (
          <li key={item.id}>
            <a
              className="link-item glass-card"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShimmerOverlay />
              <h3>{item.title}</h3>
              <span className="outlet">{item.outlet}</span>
              <p className="link-blurb">{item.blurb}</p>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
