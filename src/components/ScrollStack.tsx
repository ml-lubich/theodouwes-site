"use client";

import { createRef, useMemo, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useScrollCraft } from "@/components/useScrollCraft";

/**
 * Cards pin under the header and stack as the visitor scrolls; each covered card
 * settles back (scale + themed shade overlay, not opacity, so the card beneath never shows
 * through). Compact viewports render exactly `<ul className={compactClassName}>`
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
}

export function ScrollStack({
  items,
  compactClassName,
  stickyTop = 112,
  stackOffset = 18,
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
    <StackRoot items={items} stickyTop={stickyTop} stackOffset={stackOffset} />
  );
}

type StackRootProps = Required<Pick<ScrollStackProps, "items" | "stickyTop" | "stackOffset">>;

/**
 * Cards stay in normal flow (24px apart via CSS), so the gap between consecutive
 * cards can never exceed that margin. Each card's recede is driven by the scroll
 * position of the NEXT card, from entering the viewport to reaching its pin.
 */
function StackRoot({ items, stickyTop, stackOffset }: StackRootProps) {
  const refs = useMemo(() => Array.from({ length: items.length }, () => createRef<HTMLLIElement>()), [items.length]);
  return (
    <ul data-variant="stack" className="scroll-stack">
      {items.map((item, i) => (
        <StackCard
          key={item.key}
          self={refs[i]}
          next={refs[i + 1]}
          top={stickyTop + i * stackOffset}
          pinOffset={stickyTop + (i + 1) * stackOffset}
          zIndex={i + 1}
        >
          {item.node}
        </StackCard>
      ))}
    </ul>
  );
}

interface StackCardProps {
  readonly self: RefObject<HTMLLIElement | null>;
  readonly next: RefObject<HTMLLIElement | null> | undefined;
  readonly top: number;
  readonly pinOffset: number;
  readonly zIndex: number;
  readonly children: ReactNode;
}

function StackCard({ self, next, top, pinOffset, zIndex, children }: StackCardProps) {
  // The last card has no next sibling; it tracks itself and its outputs stay flat.
  const { scrollYProgress } = useScroll({ target: next ?? self, offset: ["start end", `start ${pinOffset}px`] });
  const scale = useTransform(scrollYProgress, [0, 1], next ? [1, 0.95] : [1, 1]);
  const shade = useTransform(scrollYProgress, [0, 1], next ? [0, 0.5] : [0, 0]);
  return (
    <li ref={self} data-scroll-stack-card className="scroll-stack-card" style={{ top, zIndex }}>
      <motion.div className="scroll-stack-face" style={{ scale, transformOrigin: "50% 0%" }}>
        {children}
        <motion.span className="stack-shade" style={{ opacity: shade }} aria-hidden="true" />
      </motion.div>
    </li>
  );
}
