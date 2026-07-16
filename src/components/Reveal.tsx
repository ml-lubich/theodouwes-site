"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";

interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: "section" | "div" | "li";
  readonly id?: string;
  readonly delayMs?: number;
  readonly enable3D?: boolean;
}

export function Reveal({
  children,
  className = "",
  as = "div",
  id,
  delayMs = 0,
  enable3D = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(reduceMotion === true);
  const delay = delayMs / 1000;
  const classes = `reveal ${className}`.trim();

  const props = {
    id,
    className: classes,
    "data-reveal-visible": visible ? "true" : "false",
    "data-reveal-settled": visible ? "true" : "false",
    "data-reveal-3d": enable3D && !reduceMotion ? "true" : "false",
    initial: reduceMotion
      ? false
      : enable3D
        ? { opacity: 0, y: 36, rotateX: 8 }
        : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0, rotateX: 0 },
    viewport: { once: true, amount: 0.12, margin: "0px 0px -8% 0px" },
    onViewportEnter: () => setVisible(true),
    transition: {
      duration: reduceMotion ? 0 : 0.65,
      delay: reduceMotion ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };

  if (as === "section") {
    return <motion.section {...props}>{children}</motion.section>;
  }
  if (as === "li") {
    return <motion.li {...props}>{children}</motion.li>;
  }
  return <motion.div {...props}>{children}</motion.div>;
}
