"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useScrollCraft } from "@/components/useScrollCraft";

interface ScrollScrubProps {
  readonly as?: "div" | "ol" | "ul";
  readonly className?: string;
  readonly children: ReactNode;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Scroll-linked CSS variables, nothing else. When scroll-craft is enabled it sets
 * `data-scrub="on"` plus, on the element, `--rail` (0..1 down the element, measured
 * to a line at 60% of the viewport) and on each direct child `--p` (0 as the child
 * enters at the bottom, 1 as it leaves at the top). Sections style those variables
 * in CSS using transform-like properties only (`translate`, `opacity`, `transform`
 * on pseudo-elements), so the DOM and layout are identical to the plain version.
 */
export function ScrollScrub({ as: Tag = "div", className, children }: ScrollScrubProps) {
  const ref = useRef<HTMLElement>(null);
  const enabled = useScrollCraft();

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const box = el.getBoundingClientRect();
      el.style.setProperty("--rail", clamp01((vh * 0.6 - box.top) / box.height).toFixed(4));
      for (const child of Array.from(el.children) as HTMLElement[]) {
        const r = child.getBoundingClientRect();
        child.style.setProperty("--p", clamp01((vh - r.top) / (vh + r.height)).toFixed(4));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.dataset.scrub = "on";
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      delete el.dataset.scrub;
      el.style.removeProperty("--rail");
      for (const child of Array.from(el.children) as HTMLElement[]) child.style.removeProperty("--p");
    };
  }, [enabled]);

  const Element = Tag as "div";
  return (
    <Element ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Element>
  );
}
