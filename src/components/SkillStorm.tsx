"use client";

import { useEffect, useMemo, useRef } from "react";
import { getSkillIcon } from "@/components/SkillIcons";

/**
 * Ported from ml-lubich/portfolio Skill Storm (CSS 3D carousel).
 * Styled for Theo’s black/white quant tokens — no Tailwind / portfolio edits.
 *
 * Every skill rides one of several near-edge-on rings. One shared angle
 * (`--storm-angle`) drives the field; each pill derives its spot via CSS trig.
 * Horizontal reach is expressed in container-query units (see globals.css),
 * so pills scale with the stage and can never leave it at any viewport.
 */

const RING_SQUASH = 0.1;
const PILL_SPACING = 104;
const IDLE_DRIFT = 0.03;
const DRAG_SENSITIVITY = 0.32;
const FLING_FRICTION = 0.95;
const DRAG_CLICK_THRESHOLD = 6;

interface RingSpec {
  /** Horizontal radius (normalized against MAX_RX before hitting CSS). */
  readonly rx: number;
  /** Depth cue: outer rings sit slightly smaller. */
  readonly scale: number;
  /** Vertical tier (px from centre) — spreads the rings into storm bands. */
  readonly y: number;
}

const RINGS: readonly RingSpec[] = [
  { rx: 132, scale: 1.0, y: -44 },
  { rx: 232, scale: 0.97, y: 56 },
  { rx: 320, scale: 0.93, y: -88 },
  { rx: 400, scale: 0.89, y: 116 },
  { rx: 468, scale: 0.85, y: -138 },
  { rx: 524, scale: 0.82, y: 168 },
];

const MAX_RX = Math.max(...RINGS.map((ring) => ring.rx));

/* Particle-cloud scatter: each pill drifts off its tier by a stable ±px so
   the bands dissolve into a cloud. Bounded so tier + scatter + squash motion
   stays inside the stage height. */
const SCATTER_Y = 76;

/** Ramanujan ellipse-perimeter approximation → how many pills a ring fits. */
function ringCapacity(rx: number): number {
  const a = rx;
  const b = rx * RING_SQUASH;
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
  const perim = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  return Math.max(3, Math.floor(perim / PILL_SPACING));
}

/** Stable per-index jitter in [-0.5, 0.5] — no Math.random, SSR-safe. */
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
  // Fill rings inner→outer up to capacity; overflow lands on the outer ring.
  const buckets: string[][] = RINGS.map(() => []);
  let cursor = 0;
  for (let r = 0; r < RINGS.length; r++) {
    const cap =
      r === RINGS.length - 1 ? Number.POSITIVE_INFINITY : ringCapacity(RINGS[r].rx);
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
      // Even spread + gentle jitter so it churns like weather, not a clock face.
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

export function getSkillStormLayout(skills: readonly string[]): readonly PlacedPill[] {
  return buildLayout(Array.from(new Set(skills)));
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
              width: `calc(var(--storm-span) * ${(ring.rx / MAX_RX).toFixed(4)} * 2)`,
              aspectRatio: "10",
              marginTop: `calc(${ring.y}px * var(--storm-ky, 1))`,
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
                "--rx-n": p.ring.rx / MAX_RX,
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
              {getSkillIcon(p.name)}
              {p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
