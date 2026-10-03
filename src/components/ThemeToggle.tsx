"use client";

import { useTheme } from "@/components/ThemeProvider";
import type { ThemePref } from "@/lib/theme";

const OPTIONS: readonly { pref: ThemePref; label: string; icon: React.ReactNode }[] = [
  {
    pref: "system",
    label: "System theme",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    pref: "light",
    label: "Light theme",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  { pref: "dark", label: "Dark theme", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /> },
];

/** System / Light / Dark segmented control; the pressed button states the current choice. */
export function ThemeToggle() {
  const { pref, setPref } = useTheme();

  return (
    <div role="group" aria-label="Color theme" className="theme-toggle">
      {OPTIONS.map((o) => (
        <button
          key={o.pref}
          type="button"
          aria-label={o.label}
          aria-pressed={pref === o.pref}
          title={o.label}
          onClick={() => setPref(o.pref)}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {o.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
