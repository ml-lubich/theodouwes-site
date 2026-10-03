"use client";

import { useEffect, useState } from "react";
import { shouldUseCompactScrollStackViewport } from "@/lib/scroll-stack-layout";

/**
 * True only on wide, mouse-driven, motion-ok desktops (see lib/scroll-stack-layout).
 * `false` on the server and first client render, so SSR paints today's layout and
 * every scroll effect switches on after mount. Phones, touch, reduced-motion and
 * low-core devices never flip it.
 */
export function useScrollCraft(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compute = () =>
      setEnabled(
        !shouldUseCompactScrollStackViewport({
          innerWidth: window.innerWidth,
          pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
          hoverNone: window.matchMedia("(hover: none)").matches,
          maxTouchPoints: navigator.maxTouchPoints ?? 0,
          prefersReducedMotion: motion.matches,
          hardwareConcurrency: navigator.hardwareConcurrency,
        }),
      );
    compute();
    window.addEventListener("resize", compute, { passive: true });
    motion.addEventListener("change", compute);
    return () => {
      window.removeEventListener("resize", compute);
      motion.removeEventListener("change", compute);
    };
  }, []);

  return enabled;
}
