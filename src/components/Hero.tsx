"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const WhiteBrain = dynamic(
  () => import("@/components/WhiteBrain").then((m) => m.WhiteBrain),
  {
    ssr: false,
    loading: () => (
      <div className="brain-stage is-loading" aria-hidden="true" />
    ),
  },
);

interface Cta {
  readonly label: string;
  readonly href: string;
}

interface HeroProps {
  readonly brand: string;
  readonly title: string;
  readonly headline: string;
  readonly subhead: string;
  readonly photoSrc: string;
  readonly photoAlt: string;
  readonly signals: readonly string[];
  readonly primaryCta: Cta;
  readonly secondaryCta: Cta;
}

function splitBrand(brand: string): { first: string; last: string } {
  const parts = brand.trim().split(/\s+/);
  if (parts.length < 2) return { first: brand, last: "" };
  return {
    first: parts.slice(0, -1).join(" "),
    last: parts[parts.length - 1] ?? "",
  };
}

export function Hero({
  brand,
  title,
  headline,
  subhead,
  photoSrc,
  photoAlt,
  signals,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  const { first, last } = splitBrand(brand);

  return (
    <section className="hero" id="top" aria-labelledby="hero-brand">
      <div className="hero-copy">
        <p className="eyebrow">{title}</p>
        <h1 className="hero-brand" id="hero-brand">
          <span className="hero-brand-line">{first}{" "}</span>
          <span className="hero-brand-last">{last || brand}</span>
        </h1>
        <div className="hero-brain" aria-hidden="true">
          <WhiteBrain backdrop />
          <p className="brain-hint">Drag to rotate</p>
        </div>
        <p className="hero-title">{headline}</p>
        <p className="hero-sub">{subhead}</p>
        <div className="cta-row">
          <a className="btn btn-primary interactive" href={primaryCta.href}>
            {primaryCta.label}
          </a>
          <a
            className="btn btn-ghost interactive"
            href={secondaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {secondaryCta.label}
          </a>
        </div>
        <div className="signal-row" aria-label="Focus areas">
          {signals.map((signal) => (
            <span className="signal-chip interactive" key={signal}>
              {signal}
            </span>
          ))}
        </div>
      </div>
      <div className="hero-media">
        <div className="portrait-frame interactive">
          <Image
            src={photoSrc}
            alt={photoAlt}
            width={800}
            height={800}
            priority
            sizes="(max-width: 900px) 90vw, 380px"
          />
          <p className="portrait-meta">SF Bay · Quant · AI Transformation</p>
        </div>
      </div>
    </section>
  );
}
