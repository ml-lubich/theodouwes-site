"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;
const DEFAULT_INTERVAL_MS = 4200;

interface RoleRotatorProps {
  readonly roles: readonly string[];
  readonly className?: string;
  readonly intervalMs?: number;
}

export function RoleRotator({
  roles,
  className = "",
  intervalMs = DEFAULT_INTERVAL_MS,
}: RoleRotatorProps) {
  // Read the media query directly (same pattern as SkillStorm) — framer's
  // useReducedMotion caches a module-level singleton that ignores runtime
  // matchMedia changes, which also makes it untestable.
  const [reduceMotion, setReduceMotion] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    if (reduceMotion || roles.length < 2) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [reduceMotion, roles.length, intervalMs]);

  const active = roles[index] ?? roles[0] ?? "";

  return (
    <span className={`role-rotator ${className}`.trim()}>
      {reduceMotion ? (
        <span className="role-rotator-item">{active}</span>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              className="role-rotator-item"
              aria-hidden="true"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease }}
            >
              {active}
            </motion.span>
          </AnimatePresence>
          <span className="sr-only">{active}</span>
        </>
      )}
    </span>
  );
}
