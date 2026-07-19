import type { ReactNode } from "react";
import { getSkillCategory } from "@/lib/skills";

/**
 * Monochrome skill glyphs — small stroke-based SVGs in Theo's black/white
 * language (no brand logos, no icon deps). Skills resolve to a glyph via
 * keyword overrides first, then their category.
 */

function glyph(children: ReactNode) {
  return (
    <svg
      className="skill-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const GLYPHS = {
  target: glyph(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 11.9v.2" />
    </>,
  ),
  code: glyph(
    <>
      <polyline points="8 6 3 12 8 18" />
      <polyline points="16 6 21 12 16 18" />
    </>,
  ),
  chart: glyph(
    <>
      <path d="M3 20h18" />
      <path d="M5 16l4.5-6 3.5 3 5.5-8" />
    </>,
  ),
  sparkle: glyph(
    <>
      <path d="M11 3l1.7 4.8L17.5 9.5l-4.8 1.7L11 16l-1.7-4.8L4.5 9.5l4.8-1.7z" />
      <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>,
  ),
  curve: glyph(
    <>
      <path d="M2.5 19c4.5 0 5-12 9.5-12s5 12 9.5 12" />
      <path d="M3 21h18" />
    </>,
  ),
  trending: glyph(
    <>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </>,
  ),
  appwindow: glyph(
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 9h18" />
      <path d="M6.5 6.8h.01M9.5 6.8h.01" />
    </>,
  ),
  cloud: glyph(
    <path d="M17.5 19a4.5 4.5 0 0 0 .4-9A6 6 0 0 0 6.3 11.7 3.9 3.9 0 0 0 7 19.4z" />,
  ),
  shield: glyph(
    <>
      <path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.8-7 9.8-4.1-2-7-5.4-7-9.8V5.8z" />
      <path d="M9 12l2 2 4-4.5" />
    </>,
  ),
  globe: glyph(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.8 3.4 2.8 13.6 0 17-2.8-3.4-2.8-13.6 0-17z" />
    </>,
  ),
  branch: glyph(
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7v10" />
      <path d="M6 13c6 0 9-1 12-3.2" />
    </>,
  ),
  db: glyph(
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.7" />
      <path d="M4.5 5.5v13c0 1.5 3.4 2.7 7.5 2.7s7.5-1.2 7.5-2.7v-13" />
      <path d="M4.5 12c0 1.5 3.4 2.7 7.5 2.7s7.5-1.2 7.5-2.7" />
    </>,
  ),
  terminal: glyph(
    <>
      <polyline points="4 6.5 9.5 12 4 17.5" />
      <path d="M12.5 17.5H20" />
    </>,
  ),
  box: glyph(
    <>
      <path d="M21 7.8L12 3 3 7.8v8.4l9 4.8 9-4.8z" />
      <path d="M3 7.8l9 4.7 9-4.7" />
      <path d="M12 12.5V21" />
    </>,
  ),
  table: glyph(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 15h18M9.5 4v16" />
    </>,
  ),
  notebook: glyph(
    <>
      <path d="M5 4a1.5 1.5 0 0 1 1.5-1.5H19v19H6.5A1.5 1.5 0 0 1 5 20z" />
      <path d="M19 17H6.5a1.5 1.5 0 0 0 0 3" />
      <path d="M9 7h6" />
    </>,
  ),
  plug: glyph(
    <>
      <path d="M9 7V3.5M15 7V3.5" />
      <path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z" />
      <path d="M12 16v4.5" />
    </>,
  ),
} as const;

type GlyphName = keyof typeof GLYPHS;

const KEYWORD_GLYPHS: readonly (readonly [RegExp, GlyphName])[] = [
  [/git/i, "branch"],
  [/sql|database/i, "db"],
  [/docker/i, "box"],
  [/bash|shell|cli|ssh|cron/i, "terminal"],
  [/excel|vba|pivot/i, "table"],
  [/jupyter|notebook/i, "notebook"],
  [/\bapi|rest|fastapi/i, "plug"],
  [/streamlit|shiny|dashboard/i, "appwindow"],
  [/aws|digitalocean|cloud/i, "cloud"],
  [/test|validation|quality|integrity|reproducib|assumption/i, "shield"],
];

const CATEGORY_GLYPHS: Readonly<Record<string, GlyphName>> = {
  "Roles & focus": "target",
  "Languages & tooling": "code",
  "Python data / ML": "chart",
  "LLM / AI engineering": "sparkle",
  "Quant / stats methods": "curve",
  "Markets / risk / underwriting": "trending",
  "Data apps / full-stack lite": "appwindow",
  "Cloud, automation & ops": "cloud",
  "Testing & analytical rigor": "shield",
  Domains: "globe",
};

export function getCategoryIcon(category: string): ReactNode {
  return GLYPHS[CATEGORY_GLYPHS[category] ?? "target"];
}

export function getSkillIcon(skill: string): ReactNode {
  const override = KEYWORD_GLYPHS.find(([pattern]) => pattern.test(skill));
  if (override) return GLYPHS[override[1]];
  const category = getSkillCategory(skill);
  return GLYPHS[(category && CATEGORY_GLYPHS[category]) || "target"];
}
