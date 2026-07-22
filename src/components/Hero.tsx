"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

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
  readonly portraitMeta: string;
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

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({
  brand,
  title,
  headline,
  subhead,
  photoSrc,
  photoAlt,
  portraitMeta,
  signals,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  const { first, last } = splitBrand(brand);
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease },
        };

  return (
    <section className="hero" id="top" aria-labelledby="hero-brand">
      <div className="hero-copy">
        <motion.p className="eyebrow" {...fadeUp(0.05)}>
          {title}
        </motion.p>
        <div className="hero-namewrap">
          <div className="hero-brain" aria-hidden="true">
            <WhiteBrain backdrop />
          </div>
          <motion.h1
            className="hero-brand"
            id="hero-brand"
            {...fadeUp(0.12)}
          >
            <span className="hero-brand-line">{first}{" "}</span>
            <span className="hero-brand-last">{last || brand}</span>
          </motion.h1>
        </div>
        <motion.div
          className="hero-media"
          initial={reduceMotion ? false : { opacity: 0, x: 36, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: reduceMotion ? 0 : 0.2, ease }}
        >
          <motion.div
            className="portrait-frame interactive"
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <Image
              src={photoSrc}
              alt={photoAlt}
              width={800}
              height={800}
              priority
              sizes="(max-width: 900px) 90vw, 380px"
            />
            <p className="portrait-meta">{portraitMeta}</p>
          </motion.div>
        </motion.div>
        <motion.p className="hero-title" {...fadeUp(0.22)}>
          {headline}
        </motion.p>
        <motion.p className="hero-sub" {...fadeUp(0.3)}>
          {subhead}
        </motion.p>
        <motion.div className="cta-row" {...fadeUp(0.38)}>
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
        </motion.div>
        <motion.div
          className="signal-row"
          aria-label="Focus areas"
          {...fadeUp(0.46)}
        >
          {signals.map((signal, index) => (
            <motion.span
              className="signal-chip interactive"
              key={signal}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: reduceMotion ? 0 : 0.52 + index * 0.06,
                ease,
              }}
            >
              {signal}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
