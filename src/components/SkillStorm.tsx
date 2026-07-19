"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * Ported from ml-lubich/portfolio Skill Storm (CSS 3D carousel).
 * Styled for Theo’s black/white quant tokens — no Tailwind / portfolio edits.
 */

const MAX_VISIBLE_SKILLS = 12;
const IDLE_DRIFT = 0.03;
const DRAG_SENSITIVITY = 0.32;
const FLING_FRICTION = 0.95;
const DRAG_CLICK_THRESHOLD = 6;

interface RingSpec {
  readonly rx: number;
  readonly ry: number;
  readonly scale: number;
  readonly count: number;
  readonly phase: number;
}

/* Ring phase offsets are tuned (brute-force over projected pill boxes at
   1000–1920px stages) so no two pills collide at any rotation angle. */
const RINGS: readonly RingSpec[] = [
  { rx: 260, ry: 130, scale: 0.96, count: 3, phase: 0 },
  { rx: 380, ry: 170, scale: 0.91, count: 3, phase: 70 },
  { rx: 500, ry: 210, scale: 0.86, count: 3, phase: 30 },
  { rx: 620, ry: 250, scale: 0.81, count: 3, phase: 95 },
];

const SCATTER_Y = 10;
const MAX_RX = Math.max(...RINGS.map((ring) => ring.rx));

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

function sampleSkills(skills: readonly string[]): readonly string[] {
  const unique = Array.from(new Set(skills));
  if (unique.length <= MAX_VISIBLE_SKILLS) return unique;
  return Array.from({ length: MAX_VISIBLE_SKILLS }, (_, index) =>
    unique[Math.round((index * (unique.length - 1)) / (MAX_VISIBLE_SKILLS - 1))]!,
  );
}

function buildLayout(skills: readonly string[]): PlacedPill[] {
  const buckets: string[][] = RINGS.map(() => []);
  let cursor = 0;
  for (let r = 0; r < RINGS.length; r++) {
    const cap = RINGS[r].count;
    while (buckets[r].length < cap && cursor < skills.length) {
      buckets[r].push(skills[cursor++]!);
    }
    if (cursor >= skills.length) break;
  }

  const placed: PlacedPill[] = [];
  buckets.forEach((names, r) => {
    const ring = RINGS[r]!;
    names.forEach((name, i) => {
      const seed = r * 97 + i * 13 + 1;
      placed.push({
        name,
        ring,
        phase: (i / names.length) * 360 + ring.phase,
        offsetY: jitter(seed * 3 + 7) * SCATTER_Y,
      });
    });
  });
  return placed;
}

export function getSkillStormLayout(skills: readonly string[]): readonly PlacedPill[] {
  return buildLayout(sampleSkills(skills));
}

interface SkillStormProps {
  readonly skills: readonly string[];
  readonly onSelect?: (skill: string) => void;
}

export function SkillStorm({ skills, onSelect }: SkillStormProps) {
  const pills = useMemo(() => getSkillStormLayout(skills), [skills]);

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
              width: `calc((50cqw - 150px) * ${(ring.rx / MAX_RX).toFixed(4)} * 2)`,
              height: ring.ry * 2,
            }}
          />
        ))}
      </div>

      <div ref={rotatorRef} className="skill-storm-3d">
        {pills.map((p) => (
          <div
            key={p.name}
            className="skill-orbit-item"
            style={
              {
                "--phase": `${p.phase}deg`,
                "--rx-n": p.ring.rx / MAX_RX,
                "--orbit-ry": p.ring.ry,
                "--rs": p.ring.scale,
                "--offset-y": `${p.offsetY}px`,
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
