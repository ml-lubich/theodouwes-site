"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useScrollCraft } from "@/components/useScrollCraft";

/**
 * Cards pin under the header and stack as the visitor scrolls; each covered card
 * settles back (scale + brightness, not opacity, so the card beneath never shows
 * through on the dark page). Compact viewports render exactly `<ul className={compactClassName}>`
 * with one `<li>` per item, i.e. today's markup.
 *
 * ponytail: the variant is decided after mount, so SSR and first paint are always
 * the compact list; the section is below the fold so the swap lands before it is
 * seen. A deep link to #projects pressed before hydration may land a little off.
 */
export type ScrollStackItem = { readonly key: string; readonly node: ReactNode };

interface ScrollStackProps {
  readonly items: readonly ScrollStackItem[];
  readonly compactClassName: string;
  readonly stickyTop?: number;
  readonly stackOffset?: number;
  readonly scrollPerCard?: number;
}

export function ScrollStack({
  items,
  compactClassName,
  stickyTop = 112,
  stackOffset = 18,
  scrollPerCard = 62,
}: ScrollStackProps) {
  const stack = useScrollCraft();

  if (!stack) {
    return (
      <ul className={compactClassName}>
        {items.map((item) => (
          <li key={item.key}>{item.node}</li>
        ))}
      </ul>
    );
  }
  return (
    <StackRoot items={items} stickyTop={stickyTop} stackOffset={stackOffset} scrollPerCard={scrollPerCard} />
  );
}

type StackRootProps = Required<Pick<ScrollStackProps, "items" | "stickyTop" | "stackOffset" | "scrollPerCard">>;

/** Owns the ref so `useScroll` only runs with a mounted target. */
function StackRoot({ items, stickyTop, stackOffset, scrollPerCard }: StackRootProps) {
  const ref = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <ul ref={ref} data-variant="stack" className="scroll-stack">
      {items.map((item, i) => (
        <StackCard
          key={item.key}
          index={i}
          count={items.length}
          progress={scrollYProgress}
          top={stickyTop + i * stackOffset}
          runwayVh={scrollPerCard}
        >
          {item.node}
        </StackCard>
      ))}
    </ul>
  );
}

interface StackCardProps {
  readonly index: number;
  readonly count: number;
  readonly progress: MotionValue<number>;
  readonly top: number;
  readonly runwayVh: number;
  readonly children: ReactNode;
}

function StackCard({ index, count, progress, top, runwayVh, children }: StackCardProps) {
  const isLast = index === count - 1;
  const from = (index + 1) / count;
  const to = Math.min(1, (index + 2) / count);
  const scale = useTransform(progress, [from, to], isLast ? [1, 1] : [1, 0.94]);
  const dim = useTransform(progress, [from, to], isLast ? [1, 1] : [1, 0.6]);
  const filter = useTransform(dim, (d) => `brightness(${d})`);
  return (
    <li data-scroll-stack-card className="scroll-stack-card" style={{ top, minHeight: `${runwayVh}vh` }}>
      <motion.div className="scroll-stack-face" style={{ scale, filter, transformOrigin: "50% 0%" }}>
        {children}
      </motion.div>
    </li>
  );
}
