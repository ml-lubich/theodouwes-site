"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders native Mermaid DSL (graph TD, flowchart LR, …) inside TheoAI.
 * This site has no JSON diagram renderer, so mermaid is the one diagram
 * path — see `lib/ai/chat-segments.ts`.
 *
 * ponytail: reads `data-theme` off <html> once, at mount. Flipping the site
 * theme while a diagram is already on screen leaves it on the theme it was
 * drawn under until the next message — a live re-render would need a
 * MutationObserver for a cosmetic mismatch nobody has reported.
 */
export function TheoAIMermaid({ source }: { source: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    setFailed(false);
    host.replaceChildren();

    void (async () => {
      const mermaid = (await import("mermaid")).default;
      const dark = document.documentElement.getAttribute("data-theme") !== "light";
      mermaid.initialize({
        startOnLoad: false,
        theme: dark ? "dark" : "neutral",
        securityLevel: "strict",
        fontFamily: "var(--font-ui)",
      });

      try {
        const { svg } = await mermaid.render(`theoai-mermaid-${uid}-${Date.now()}`, source.trim());
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, uid]);

  if (failed) {
    return <pre className="theoai-mermaid-fallback">{source.trim()}</pre>;
  }

  return (
    <div className="theoai-mermaid">
      <div ref={hostRef} className="theoai-mermaid-host" />
    </div>
  );
}
