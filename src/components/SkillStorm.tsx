"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * Ported from ml-lubich/portfolio Skill Storm (CSS 3D carousel).
 * Styled for Theo’s black/white quant tokens — no Tailwind / portfolio edits.
 */

const RING_SQUASH = 0.1;
const PILL_SPACING = 104;
const IDLE_DRIFT = 0.03;
const DRAG_SENSITIVITY = 0.32;
const FLING_FRICTION = 0.95;
const DRAG_CLICK_THRESHOLD = 6;

interface RingSpec {
  readonly rx: number;
  readonly scale: number;
  readonly y: number;
}

const RINGS: readonly RingSpec[] = [
  { rx: 132, scale: 1.0, y: -48 },
  { rx: 232, scale: 0.97, y: 62 },
  { rx: 320, scale: 0.93, y: -96 },
  { rx: 400, scale: 0.89, y: 126 },
  { rx: 468, scale: 0.85, y: -150 },
  { rx: 524, scale: 0.82, y: 184 },
];

const SCATTER_Y = 84;

function ringCapacity(rx: number): number {
  const a = rx;
  const b = rx * RING_SQUASH;
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
  const perim = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  return Math.max(3, Math.floor(perim / PILL_SPACING));
}

function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

interface PlacedPill {
  readonly name: string;
  readonly ring: RingSpec;
  readonly phase: number;
  readonly offsetY: number;
}

function buildLayout(skills: readonly string[]): PlacedPill[] {
  const buckets: string[][] = RINGS.map(() => []);
  let cursor = 0;
  for (let r = 0; r < RINGS.length; r++) {
    const cap = r === RINGS.length - 1 ? Number.POSITIVE_INFINITY : ringCapacity(RINGS[r].rx);
    while (buckets[r].length < cap && cursor < skills.length) {
      buckets[r].push(skills[cursor++]!);
    }
    if (cursor >= skills.length) break;
  }

  const placed: PlacedPill[] = [];
  buckets.forEach((names, r) => {
    const ring = RINGS[r]!;
    const n = names.length;
    names.forEach((name, i) => {
      const seed = r * 97 + i * 13 + 1;
      const angle =
        (i / n) * Math.PI * 2 + r * 0.618 + jitter(seed) * (Math.PI / n) * 0.9;
      placed.push({
        name,
        ring,
        phase: (angle * 180) / Math.PI,
        offsetY: ring.y + jitter(seed * 3 + 7) * SCATTER_Y,
      });
    });
  });
  return placed;
}

interface SkillStormProps {
  readonly skills: readonly string[];
  readonly onSelect?: (skill: string) => void;
}

export function SkillStorm({ skills, onSelect }: SkillStormProps) {
  const pills = useMemo(() => buildLayout(Array.from(new Set(skills))), [skills]);

  const rotatorRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(0);
  const dirRef = useRef(1);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const tick = () => {
      if (!draggingRef.current) {
        const idle = reduce ? 0 : IDLE_DRIFT * dirRef.current;
        velocityRef.current = idle + (velocityRef.current - idle) * FLING_FRICTION;
        if (!pausedRef.current) angleRef.current += velocityRef.current;
      }
      rotatorRef.current?.style.setProperty("--storm-angle", `${angleRef.current}deg`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    movedRef.current = 0;
    velocityRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    movedRef.current += Math.abs(dx);
    if (
      movedRef.current > DRAG_CLICK_THRESHOLD &&
      !e.currentTarget.hasPointerCapture?.(e.pointerId)
    ) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const delta = -dx * DRAG_SENSITIVITY;
    angleRef.current += delta;
    velocityRef.current = delta;
    if (dx !== 0) dirRef.current = Math.sign(delta);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleSelect = (name: string) => {
    if (movedRef.current > DRAG_CLICK_THRESHOLD) return;
    onSelect?.(name);
  };

  return (
    <div
      className="skill-storm"
      role="group"
      aria-label="Interactive storm of skills — drag to spin"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="skill-storm-glow" aria-hidden="true">
        <div className="skill-storm-orb" />
        {RINGS.map((ring) => (
          <div
            key={ring.rx}
            className="skill-storm-ring"
            style={{
              width: ring.rx * 2,
              height: ring.rx * 2 * RING_SQUASH,
              marginTop: ring.y,
            }}
          />
        ))}
      </div>

      <div ref={rotatorRef} className="skill-storm-3d">
        <div className="skill-storm-center" aria-hidden="true">
          <p className="skill-storm-eyebrow">A storm of</p>
          <p className="skill-storm-title">Skills</p>
          <p className="skill-storm-hint">drag to spin · hover to pause</p>
        </div>

        {pills.map((p) => (
          <div
            key={p.name}
            className="skill-orbit-item"
            style={
              {
                "--phase": `${p.phase}deg`,
                "--rx": p.ring.rx,
                "--rs": p.ring.scale,
                "--ry": `${p.offsetY}px`,
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              className="skill-pill"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => handleSelect(p.name)}
              onPointerEnter={() => {
                pausedRef.current = true;
              }}
              onPointerLeave={() => {
                pausedRef.current = false;
              }}
            >
              {p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
