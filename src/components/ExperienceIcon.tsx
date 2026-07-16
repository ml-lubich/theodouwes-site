import type { ReactNode } from "react";

interface ExperienceIconProps {
  readonly kind: string;
  readonly className?: string;
}

const paths: Record<string, ReactNode> = {
  navigara: (
    <>
      <circle cx="6" cy="12" r="2.25" />
      <circle cx="18" cy="6" r="2.25" />
      <circle cx="18" cy="18" r="2.25" />
      <path d="m8 11 8-4M8 13l8 4M18 8.5v7" />
    </>
  ),
  piedmont: (
    <>
      <path d="M4 21V7l8-4 8 4v14M8 21v-4h8v4" />
      <path d="M8 9h2M14 9h2M8 13h2M14 13h2" />
    </>
  ),
  independent: (
    <>
      <path d="M4 19h16M6 16l3-8 3 5 2-3 4 6" />
      <circle cx="18" cy="6" r="2" />
    </>
  ),
  education: (
    <>
      <path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z" />
      <path d="M6 11.5V16c3.4 2.7 8.6 2.7 12 0v-4.5M21.5 9v6" />
    </>
  ),
};

export function ExperienceIcon({ kind, className = "" }: ExperienceIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[kind] ?? paths.navigara}
    </svg>
  );
}

export function HighlightIcon() {
  return (
    <svg
      className="highlight-icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
