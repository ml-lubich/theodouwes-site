import type { CSSProperties } from "react";

/**
 * Quant weather: a sparse field of drifting monochrome math glyphs behind a
 * section's content. Pure CSS animation, SSR-deterministic placement (same
 * seeded hash as the Skill Storm), pointer-transparent, and stilled entirely
 * under prefers-reduced-motion.
 */

const GLYPHS = ["Σ", "σ", "∫", "Δ", "π", "β", "λ", "√", "≈", "±", "∂", "μ"] as const;

function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

interface AmbientFieldProps {
  readonly seed: number;
  readonly count?: number;
}

export function AmbientField({ seed, count = 9 }: AmbientFieldProps) {
  const items = Array.from({ length: count }, (_, i) => {
    const j = (k: number) => jitter(seed * 131 + i * 17 + k);
    return {
      glyph: GLYPHS[Math.abs(Math.round(j(1) * 1000)) % GLYPHS.length],
      left: 4 + (j(2) + 0.5) * 92,
      top: 6 + (j(3) + 0.5) * 84,
      scale: 0.8 + (j(4) + 0.5) * 1.7,
      duration: 16 + (j(5) + 0.5) * 14,
      delay: -(j(6) + 0.5) * 20,
      drift: 10 + (j(7) + 0.5) * 14,
    };
  });

  return (
    <div className="ambient-field" aria-hidden="true">
      {items.map((item, index) => (
        <span
          key={index}
          className="ambient-glyph"
          style={
            {
              left: `${item.left.toFixed(2)}%`,
              top: `${item.top.toFixed(2)}%`,
              "--a-scale": item.scale.toFixed(2),
              "--a-dur": `${item.duration.toFixed(1)}s`,
              "--a-delay": `${item.delay.toFixed(1)}s`,
              "--a-drift": `${item.drift.toFixed(1)}px`,
            } as CSSProperties
          }
        >
          {item.glyph}
        </span>
      ))}
    </div>
  );
}
