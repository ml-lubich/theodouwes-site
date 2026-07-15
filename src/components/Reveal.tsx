"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

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
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      setSettled(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || settled) return;
    const t = window.setTimeout(() => setSettled(true), 620 + delayMs);
    return () => window.clearTimeout(t);
  }, [visible, settled, delayMs]);

  const props = {
    id,
    className: `reveal ${className}`.trim(),
    "data-reveal-visible": visible ? "true" : "false",
    "data-reveal-settled": settled ? "true" : "false",
    "data-reveal-3d": enable3D && !visible ? "true" : "false",
    style: { transitionDelay: `${delayMs}ms` } satisfies CSSProperties,
    ref: (node: HTMLElement | null) => {
      ref.current = node;
    },
  };

  if (as === "section") {
    return <section {...props}>{children}</section>;
  }
  if (as === "li") {
    return <li {...props}>{children}</li>;
  }
  return <div {...props}>{children}</div>;
}
